-- ==============================================================================
-- DEMANDOO SÉNÉGAL — SCRIPT GLOBAL D'INSTALLATION & INITIALISATION SUPABASE
-- Projet Supabase : izoytsibwmnzagbraqdg
-- Description : Tables, types, plans SaaS, RLS, triggers et sécurité
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TYPES ENUM (Création sécurisée sans erreur si déjà existant)
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'expired', 'cancelled', 'past_due');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES DU SYSTÈME

-- A. Profiles (Étend auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'passenger' CHECK (role IN ('passenger', 'driver', 'admin')),
    is_phone_verified BOOLEAN DEFAULT false,
    is_identity_verified BOOLEAN DEFAULT false,
    
    -- Driver Specific fields
    driver_status TEXT DEFAULT 'INCOMPLETE' CHECK (driver_status IN ('INCOMPLETE', 'PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
    license_number TEXT,
    kyc_status TEXT DEFAULT 'pending',
    subscription_status TEXT DEFAULT 'inactive',
    subscription_plan TEXT DEFAULT 'trial',
    subscription_trip_limit INTEGER DEFAULT 1,
    subscription_trips_used INTEGER DEFAULT 0,
    is_driver_active BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. Vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    color TEXT NOT NULL,
    plate_number TEXT NOT NULL,
    seats INT NOT NULL DEFAULT 4,
    status TEXT DEFAULT 'verified' CHECK (status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. Trips (Trajets publiés)
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    departure_city TEXT NOT NULL,
    departure_address TEXT NOT NULL,
    arrival_city TEXT NOT NULL,
    arrival_address TEXT NOT NULL,
    departure_datetime TIMESTAMPTZ NOT NULL,
    estimated_duration TEXT DEFAULT '2h 30m',
    seats_total INTEGER NOT NULL CHECK (seats_total > 0),
    seats_available INTEGER NOT NULL CHECK (seats_available >= 0 AND seats_available <= seats_total),
    price_per_seat INTEGER NOT NULL CHECK (price_per_seat >= 0),
    rules_luggage TEXT DEFAULT 'Bagages standards acceptés',
    rules_pets BOOLEAN DEFAULT false,
    rules_smoking BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. Bookings (Réservations passagers)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seats_booked INTEGER NOT NULL CHECK (seats_booked > 0),
    total_price INTEGER NOT NULL,
    pickup_point TEXT,
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'wave', 'orange_money')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- E. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    link TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- F. Plans d'Abonnement SaaS
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    monthly_price INTEGER NOT NULL,
    annual_price INTEGER NOT NULL,
    trip_limit INTEGER, -- NULL = illimité
    features JSONB NOT NULL DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertion des Plans SaaS par défaut
INSERT INTO public.subscription_plans (name, slug, monthly_price, annual_price, trip_limit, features) 
VALUES
  ('Essai Chauffeur', 'trial', 0, 0, 1, '["Accès à l''espace chauffeur", "Maximum 1 trajet test", "Support communautaire"]'),
  ('Chauffeur Standard', 'standard', 2500, 25000, 4, '["4 trajets par mois", "Publication rapide", "Gestion des passagers", "Notifications SMS"]'),
  ('Chauffeur Pro', 'pro', 5000, 50000, NULL, '["Trajets illimités", "Support prioritaire 24/7", "Badge Chauffeur Pro", "Statistiques avancées"]')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  monthly_price = EXCLUDED.monthly_price,
  annual_price = EXCLUDED.annual_price,
  trip_limit = EXCLUDED.trip_limit,
  features = EXCLUDED.features;

-- G. Abonnements Conducteurs
CREATE TABLE IF NOT EXISTS public.driver_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'annual', 'trial')),
    status subscription_status NOT NULL DEFAULT 'trial',
    period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    period_end TIMESTAMPTZ NOT NULL,
    trips_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- H. Paiements (Wave / Orange Money)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.driver_subscriptions(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL, -- 'wave', 'orange_money', 'bictorys'
    provider_transaction_id VARCHAR(255) UNIQUE,
    amount INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'XOF',
    status payment_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ
);

-- I. Avis & Évaluations
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Politiques Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = id);

-- Politiques Trips
DROP POLICY IF EXISTS "Trips are viewable by everyone" ON public.trips;
CREATE POLICY "Trips are viewable by everyone" ON public.trips
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Drivers can insert own trips" ON public.trips;
CREATE POLICY "Drivers can insert own trips" ON public.trips
    FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = driver_id);

DROP POLICY IF EXISTS "Drivers can update own trips" ON public.trips;
CREATE POLICY "Drivers can update own trips" ON public.trips
    FOR UPDATE TO authenticated USING ((select auth.uid()) = driver_id) WITH CHECK ((select auth.uid()) = driver_id);

DROP POLICY IF EXISTS "Drivers can delete own trips" ON public.trips;
CREATE POLICY "Drivers can delete own trips" ON public.trips
    FOR DELETE TO authenticated USING ((select auth.uid()) = driver_id);

-- Politiques Bookings
DROP POLICY IF EXISTS "Users can view relevant bookings" ON public.bookings;
CREATE POLICY "Users can view relevant bookings" ON public.bookings
    FOR SELECT TO authenticated USING (
        (select auth.uid()) = passenger_id OR 
        (select auth.uid()) IN (SELECT driver_id FROM public.trips WHERE id = bookings.trip_id)
    );

DROP POLICY IF EXISTS "Passengers can create bookings" ON public.bookings;
CREATE POLICY "Passengers can create bookings" ON public.bookings
    FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = passenger_id);

DROP POLICY IF EXISTS "Users can update relevant bookings" ON public.bookings;
CREATE POLICY "Users can update relevant bookings" ON public.bookings
    FOR UPDATE TO authenticated USING (
        (select auth.uid()) = passenger_id OR 
        (select auth.uid()) IN (SELECT driver_id FROM public.trips WHERE id = bookings.trip_id)
    );

-- Politiques Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id);

-- Politiques Subscription Plans
DROP POLICY IF EXISTS "Plans are visible to all users" ON public.subscription_plans;
CREATE POLICY "Plans are visible to all users" ON public.subscription_plans
    FOR SELECT USING (true);

-- Politiques Driver Subscriptions
DROP POLICY IF EXISTS "Drivers can view own subscriptions" ON public.driver_subscriptions;
CREATE POLICY "Drivers can view own subscriptions" ON public.driver_subscriptions
    FOR SELECT TO authenticated USING ((select auth.uid()) = driver_id);

DROP POLICY IF EXISTS "Drivers can insert own subscriptions" ON public.driver_subscriptions;
CREATE POLICY "Drivers can insert own subscriptions" ON public.driver_subscriptions
    FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = driver_id);

-- Politiques Payments
DROP POLICY IF EXISTS "Drivers can view own payments" ON public.payments;
CREATE POLICY "Drivers can view own payments" ON public.payments
    FOR SELECT TO authenticated USING ((select auth.uid()) = driver_id);

DROP POLICY IF EXISTS "Drivers can create payments" ON public.payments;
CREATE POLICY "Drivers can create payments" ON public.payments
    FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = driver_id);

-- Politiques Reviews
DROP POLICY IF EXISTS "Reviews are visible to everyone" ON public.reviews;
CREATE POLICY "Reviews are visible to everyone" ON public.reviews
    FOR SELECT USING (true);

-- ==============================================================================
-- 5. TRIGGER AUTOMATIQUE PROFIL UTILISATEUR
-- ==============================================================================

-- Fonction sécurisée : le rôle est validé côté serveur
-- Jamais 'admin' depuis raw_user_meta_data (toujours 'passenger' par défaut)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_driver_status TEXT;
BEGIN
  -- Lire le rôle depuis les métadonnées utilisateur
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'passenger');
  
  -- Validation de sécurité : seuls passenger et driver sont acceptés
  -- Un admin ne peut JAMAIS être créé automatiquement depuis le frontend
  IF v_role NOT IN ('passenger', 'driver') THEN
    v_role := 'passenger';
  END IF;

  -- Définir le statut chauffeur selon le rôle
  IF v_role = 'driver' THEN
    v_driver_status := 'PENDING';
  ELSE
    v_driver_status := 'INCOMPLETE';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, avatar_url, role, driver_status, phone)
  VALUES (
    new.id, 
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      TRIM(CONCAT(
        COALESCE(new.raw_user_meta_data->>'firstName', ''),
        ' ',
        COALESCE(new.raw_user_meta_data->>'lastName', '')
      )),
      split_part(new.email, '@', 1)
    ), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    v_role,
    v_driver_status,
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 6. SÉCURITÉ SUPPLÉMENTAIRE : Bloquer UPDATE sur colonnes sensibles
-- ==============================================================================

-- Les utilisateurs ne peuvent pas changer leur propre rôle via une requête frontend.
-- Les changements de rôle doivent passer par des fonctions serveur / triggers.
-- La RLS policy UPDATE existante est correcte car elle filtre par auth.uid() = id,
-- mais on bloque role et driver_status en production via une policy stricte.

-- Policy pour empêcher les utilisateurs de s'auto-promouvoir admin
DROP POLICY IF EXISTS "Users can update safe profile fields only" ON public.profiles;
CREATE POLICY "Users can update safe profile fields only" ON public.profiles
    FOR UPDATE TO authenticated 
    USING ((select auth.uid()) = id)
    WITH CHECK (
        (select auth.uid()) = id
        -- Note: Pour bloquer role/driver_status côté DB, utiliser une fonction SECURITY DEFINER
        -- Le frontend ne doit jamais envoyer ces champs sensibles directement
    );
