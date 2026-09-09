-- ==============================================================================
-- DEMANDOO - SUBSCRIPTIONS & PAYMENTS SCHEMA
-- ==============================================================================

-- 1. SUBSCRIPTION PLANS
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  monthly_price INTEGER NOT NULL,
  annual_price INTEGER NOT NULL,
  trip_limit INTEGER, -- NULL means unlimited
  features JSONB NOT NULL DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Plans
INSERT INTO public.subscription_plans (name, slug, monthly_price, annual_price, trip_limit, features) VALUES
('Essai Chauffeur', 'trial', 0, 0, 1, '["Accès à l''espace chauffeur", "Maximum 1 trajet test"]'),
('Chauffeur Standard', 'standard', 2500, 25000, 4, '["4 trajets par mois", "Publication de trajets", "Gestion des réservations"]'),
('Chauffeur Pro', 'pro', 5000, 50000, NULL, '["Trajets illimités", "Support prioritaire", "Badge Pro"]');


-- 2. DRIVER SUBSCRIPTIONS
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'expired', 'cancelled', 'past_due');

CREATE TABLE public.driver_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL, -- references public.profiles(id)
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'annual', 'trial')),
  status subscription_status NOT NULL DEFAULT 'trial',
  period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_end TIMESTAMPTZ NOT NULL,
  trips_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. PAYMENTS
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'cancelled', 'refunded');

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.driver_subscriptions(id) ON DELETE SET NULL,
  provider VARCHAR(50) NOT NULL, -- e.g., 'wave', 'orange_money', 'ligdicash'
  provider_transaction_id VARCHAR(255) UNIQUE,
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'XOF',
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Plans are readable by everyone
CREATE POLICY "Plans are visible to all users" ON public.subscription_plans
  FOR SELECT USING (true);

-- Drivers can only view their own subscriptions
CREATE POLICY "Drivers can view own subscriptions" ON public.driver_subscriptions
  FOR SELECT USING (auth.uid() = driver_id);

-- Drivers can view their own payments
CREATE POLICY "Drivers can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = driver_id);

-- Drivers can create pending payments
CREATE POLICY "Drivers can create payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = driver_id AND status = 'pending');
