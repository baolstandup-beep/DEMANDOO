-- ========================================================================================
-- DEMANDOO — Migration 05 : Durcissement sécurité (audit 2026-10-09)
--
-- Corrige :
--   1. RPC mock_payment_webhook exécutable par n'importe quel utilisateur → abonnement gratuit
--   2. Auto-vérification chauffeur (driver_status / kyc_status modifiables depuis le navigateur)
--   3. Insertion directe de driver_subscriptions / payments par les utilisateurs
--   4. Activation de l'offre gratuite « Découverte » : désormais via RPC contrôlée (1 seule fois)
--
-- Idempotente : peut être rejouée sans risque. À exécuter dans Supabase > SQL Editor.
-- ========================================================================================

-- ─── 1. Supprimer la RPC de paiement simulé ─────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.mock_payment_webhook(TEXT, UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS public.mock_payment_webhook(TEXT, UUID, TEXT, INT);


-- ─── 2. Protéger les champs sensibles de public.profiles ───────────────────────────────
-- Un utilisateur connecté (rôle Postgres « authenticated ») ne peut plus modifier :
--   abonnement, statut chauffeur, KYC, vérifications, rôle (sauf passager → chauffeur).
-- Les admins (app_metadata.role = 'admin'), le service_role (webhooks, API serveur) et
-- les fonctions SECURITY DEFINER ne sont pas concernés.
-- La comparaison passe par jsonb : aucune erreur si une colonne n'existe pas dans votre schéma.

CREATE OR REPLACE FUNCTION public.demandoo_is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  protected_cols TEXT[] := ARRAY[
    'subscription_plan', 'subscription_status', 'subscription_trip_limit',
    'subscription_trips_used', 'payment_reference', 'last_payment_at', 'next_renewal_at',
    'driver_status', 'kyc_status', 'is_driver_verified', 'is_identity_verified',
    'is_phone_verified', 'is_admin', 'role'
  ];
  new_j JSONB;
  old_j JSONB;
  col   TEXT;
BEGIN
  -- Seuls les appels directs du navigateur sont filtrés
  IF current_user NOT IN ('authenticated', 'anon') OR public.demandoo_is_admin() THEN
    RETURN NEW;
  END IF;

  new_j := to_jsonb(NEW);

  IF TG_OP = 'INSERT' THEN
    -- Création de profil : valeurs par défaut sûres, quoi qu'envoie le client
    new_j := new_j
      || jsonb_build_object('role', CASE WHEN new_j ->> 'role' = 'driver' THEN 'driver' ELSE 'passenger' END)
      || jsonb_build_object('driver_status', CASE WHEN new_j ->> 'role' = 'driver' THEN 'PENDING' ELSE 'INCOMPLETE' END);
    FOREACH col IN ARRAY ARRAY['subscription_plan','subscription_status','subscription_trip_limit',
                               'subscription_trips_used','payment_reference','last_payment_at',
                               'next_renewal_at','kyc_status','is_driver_verified',
                               'is_identity_verified','is_phone_verified','is_admin'] LOOP
      IF new_j ? col THEN
        new_j := jsonb_set(new_j, ARRAY[col], 'null'::jsonb);
      END IF;
    END LOOP;
    IF new_j ? 'is_driver_active' THEN
      new_j := jsonb_set(new_j, '{is_driver_active}', 'false'::jsonb);
    END IF;
    NEW := jsonb_populate_record(NEW, new_j);
    RETURN NEW;
  END IF;

  -- UPDATE
  old_j := to_jsonb(OLD);

  FOREACH col IN ARRAY protected_cols LOOP
    IF new_j ? col AND (new_j -> col) IS DISTINCT FROM (old_j -> col) THEN
      -- Exceptions autorisées
      IF col = 'role'
         AND COALESCE(old_j ->> 'role', 'passenger') = 'passenger'
         AND new_j ->> 'role' = 'driver' THEN
        CONTINUE; -- un passager peut devenir chauffeur (statut PENDING ci-dessous)
      END IF;
      IF col = 'driver_status'
         AND COALESCE(old_j ->> 'driver_status', 'INCOMPLETE') IN ('INCOMPLETE', 'REJECTED')
         AND new_j ->> 'driver_status' = 'PENDING' THEN
        CONTINUE; -- soumission (ou re-soumission) d'un dossier
      END IF;
      new_j := jsonb_set(new_j, ARRAY[col], COALESCE(old_j -> col, 'null'::jsonb));
    END IF;
  END LOOP;

  -- Un chauffeur ne peut se mettre « en ligne » que s'il est vérifié
  IF new_j ? 'is_driver_active'
     AND (new_j -> 'is_driver_active') = 'true'::jsonb
     AND COALESCE(new_j ->> 'driver_status', '') <> 'VERIFIED' THEN
    new_j := jsonb_set(new_j, '{is_driver_active}', 'false'::jsonb);
  END IF;

  NEW := jsonb_populate_record(NEW, new_j);
  RETURN NEW;
END;
$$;

-- Remplace l'ancien trigger (qui ne protégeait que l'abonnement)
DROP TRIGGER IF EXISTS enforce_profile_security ON public.profiles;
DROP TRIGGER IF EXISTS protect_profile_sensitive_fields_upd ON public.profiles;
DROP TRIGGER IF EXISTS protect_profile_sensitive_fields_ins ON public.profiles;

CREATE TRIGGER protect_profile_sensitive_fields_upd
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_sensitive_fields();

CREATE TRIGGER protect_profile_sensitive_fields_ins
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_sensitive_fields();


-- ─── 3. Abonnements & paiements : écriture réservée au serveur ─────────────────────────
DROP POLICY IF EXISTS "Drivers can insert own subscriptions" ON public.driver_subscriptions;
DROP POLICY IF EXISTS "Drivers can create own subscriptions" ON public.driver_subscriptions;
DROP POLICY IF EXISTS "Drivers can update own subscriptions" ON public.driver_subscriptions;
DROP POLICY IF EXISTS "Drivers can create payments" ON public.payments;

REVOKE INSERT, UPDATE, DELETE ON public.driver_subscriptions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.payments FROM anon, authenticated;


-- ─── 4. Offre gratuite « Découverte » : 1 seule fois par chauffeur ─────────────────────
CREATE OR REPLACE FUNCTION public.start_free_trial()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid     UUID := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_plan_id UUID;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Non authentifié' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid;
  IF NOT FOUND OR v_profile.role <> 'driver' THEN
    RAISE EXCEPTION 'Réservé aux chauffeurs' USING ERRCODE = '42501';
  END IF;

  -- Déjà eu un abonnement (essai ou payant) → refus
  IF v_profile.subscription_plan IS NOT NULL
     OR EXISTS (SELECT 1 FROM public.driver_subscriptions WHERE driver_id = v_uid) THEN
    RETURN jsonb_build_object('status', 'already_used');
  END IF;

  SELECT id INTO v_plan_id FROM public.subscription_plans
   WHERE slug IN ('trial', 'decouverte', 'free') ORDER BY monthly_price LIMIT 1;

  IF v_plan_id IS NOT NULL THEN
    INSERT INTO public.driver_subscriptions (driver_id, plan_id, billing_cycle, status, period_end)
    VALUES (v_uid, v_plan_id, 'trial', 'trial', NOW() + INTERVAL '1 month');
  END IF;

  UPDATE public.profiles
     SET subscription_plan       = 'trial',
         subscription_status     = 'trial',
         subscription_trip_limit = 1,
         subscription_trips_used = 0
   WHERE id = v_uid;

  RETURN jsonb_build_object('status', 'success');
END;
$$;

REVOKE ALL ON FUNCTION public.start_free_trial() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_free_trial() TO authenticated;


-- ─── 5. Activation d'un abonnement payé (appelée UNIQUEMENT par le webhook serveur) ────
CREATE OR REPLACE FUNCTION public.activate_paid_subscription(
  p_reference      TEXT,
  p_provider_tx_id TEXT,
  p_amount         INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_payment public.payments%ROWTYPE;
  v_plan    public.subscription_plans%ROWTYPE;
  v_slug    TEXT;
  v_sub_id  UUID;
BEGIN
  SELECT * INTO v_payment FROM public.payments
   WHERE provider_transaction_id = p_reference FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'unknown_reference');
  END IF;
  IF v_payment.status = 'paid' THEN
    RETURN jsonb_build_object('status', 'already_processed');
  END IF;
  IF p_amount IS NULL OR p_amount < v_payment.amount THEN
    RETURN jsonb_build_object('status', 'amount_mismatch');
  END IF;

  -- Référence générée par /api/payments/checkout : sub_<slug>_<uuid>_<timestamp>
  v_slug := split_part(p_reference, '_', 2);
  SELECT * INTO v_plan FROM public.subscription_plans WHERE slug = v_slug LIMIT 1;

  IF v_plan.id IS NOT NULL THEN
    INSERT INTO public.driver_subscriptions (driver_id, plan_id, billing_cycle, status, period_end)
    VALUES (v_payment.driver_id, v_plan.id, 'monthly', 'active', NOW() + INTERVAL '1 month')
    RETURNING id INTO v_sub_id;
  END IF;

  UPDATE public.payments
     SET status = 'paid', confirmed_at = NOW(), subscription_id = v_sub_id
   WHERE id = v_payment.id;

  UPDATE public.profiles
     SET subscription_plan       = v_slug,
         subscription_status     = 'active',
         subscription_trips_used = 0,
         subscription_trip_limit = CASE WHEN v_slug = 'pro' THEN 999999
                                        ELSE COALESCE(v_plan.trip_limit, 4) END,
         payment_reference       = COALESCE(p_provider_tx_id, p_reference),
         last_payment_at         = NOW(),
         next_renewal_at         = NOW() + INTERVAL '1 month'
   WHERE id = v_payment.driver_id;

  RETURN jsonb_build_object('status', 'success');
END;
$$;

REVOKE ALL ON FUNCTION public.activate_paid_subscription(TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_paid_subscription(TEXT, TEXT, INTEGER) TO service_role;


-- ─── 6. Seuls les chauffeurs VÉRIFIÉS peuvent publier un trajet ──────────────────────────
-- Politique RESTRICTIVE : s'ajoute (ET logique) aux politiques existantes sur trips.
DROP POLICY IF EXISTS "Only verified drivers can publish trips" ON public.trips;
CREATE POLICY "Only verified drivers can publish trips" ON public.trips
  AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (
    public.demandoo_is_admin()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
       WHERE p.id = auth.uid() AND p.driver_status = 'VERIFIED'
    )
  );


-- ─── 7. Vérifications post-migration (à lire dans les résultats) ────────────────────────
-- Doit renvoyer 0 ligne :
--   SELECT proname FROM pg_proc WHERE proname = 'mock_payment_webhook';
-- Doit renvoyer uniquement des politiques SELECT pour authenticated :
--   SELECT tablename, policyname, cmd FROM pg_policies
--    WHERE tablename IN ('driver_subscriptions','payments');
