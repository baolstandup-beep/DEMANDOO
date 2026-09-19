-- ========================================================================================
-- DEMANDOO — Migration 04 : Authentification Téléphone + PIN Sécurisée
-- Sans Twilio, sans email. Custom JWT compatible avec les RLS Supabase existantes.
-- ========================================================================================

-- 1. Table sécurisée des credentials des chauffeurs (PIN hashé)
CREATE TABLE IF NOT EXISTS public.driver_credentials (
  id           UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID       NOT NULL,
  phone        TEXT       NOT NULL,
  pin_hash     TEXT       NOT NULL,
  attempts     INT        NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT driver_credentials_phone_unique UNIQUE (phone),
  CONSTRAINT driver_credentials_user_unique  UNIQUE (user_id)
);

-- Index de recherche par téléphone (lookup rapide à la connexion)
CREATE INDEX IF NOT EXISTS idx_driver_creds_phone ON public.driver_credentials (phone);

-- Activation RLS — aucun accès authenticated ou anon autorisé
ALTER TABLE public.driver_credentials ENABLE ROW LEVEL SECURITY;

-- Retirer TOUTES les permissions sur authenticated et anon
REVOKE ALL ON public.driver_credentials FROM anon, authenticated;

-- Seul le service_role peut accéder (via les fonctions SECURITY DEFINER ci-dessous)
GRANT ALL ON public.driver_credentials TO service_role;

-- ========================================================================================
-- 2. RPC Atomique : Inscription Chauffeur
-- Crée le profil ET les credentials en une seule transaction
-- ========================================================================================
CREATE OR REPLACE FUNCTION public.register_driver_custom(
  p_user_id   UUID,
  p_phone     TEXT,
  p_pin_hash  TEXT,
  p_full_name TEXT,
  p_avatar_url TEXT DEFAULT ''
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Insérer les credentials (phone + PIN hashé)
  INSERT INTO public.driver_credentials (user_id, phone, pin_hash)
  VALUES (p_user_id, p_phone, p_pin_hash);

  -- Mettre à jour le profil avec le rôle chauffeur
  UPDATE public.profiles
  SET
    role           = 'driver',
    driver_status  = 'PENDING',
    is_driver_active = false,
    phone          = p_phone,
    avatar_url     = COALESCE(NULLIF(p_avatar_url, ''), avatar_url),
    updated_at     = now()
  WHERE id = p_user_id;
END;
$$;

-- Sécurité : seul le service_role peut appeler cette RPC
REVOKE ALL ON FUNCTION public.register_driver_custom FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_driver_custom TO service_role;

-- ========================================================================================
-- 3. RPC : Vérification du PIN (retourne user_id + état du lock)
-- ========================================================================================
CREATE OR REPLACE FUNCTION public.check_driver_pin(
  p_phone   TEXT,
  p_now     TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE (
  user_id      UUID,
  pin_hash     TEXT,
  attempts     INT,
  locked_until TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT user_id, pin_hash, attempts, locked_until
  FROM public.driver_credentials
  WHERE phone = p_phone
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.check_driver_pin FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_driver_pin TO service_role;

-- ========================================================================================
-- 4. RPC : Mise à jour des tentatives de connexion (anti-brute force)
-- ========================================================================================
CREATE OR REPLACE FUNCTION public.update_driver_login_attempt(
  p_phone       TEXT,
  p_success     BOOLEAN,
  p_now         TIMESTAMPTZ DEFAULT now()
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_attempts INT;
BEGIN
  SELECT attempts INTO v_attempts FROM public.driver_credentials WHERE phone = p_phone;

  IF p_success THEN
    UPDATE public.driver_credentials
    SET attempts = 0, locked_until = NULL, updated_at = p_now
    WHERE phone = p_phone;
  ELSE
    IF v_attempts + 1 >= 5 THEN
      -- Bloquer pour 15 minutes
      UPDATE public.driver_credentials
      SET attempts = v_attempts + 1,
          locked_until = p_now + INTERVAL '15 minutes',
          updated_at = p_now
      WHERE phone = p_phone;
    ELSE
      UPDATE public.driver_credentials
      SET attempts = v_attempts + 1,
          updated_at = p_now
      WHERE phone = p_phone;
    END IF;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.update_driver_login_attempt FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_driver_login_attempt TO service_role;
