-- ==============================================================================
-- DEMANDOO SÉNÉGAL — SEED DES DONNÉES DEPUIS BASE44 (demandoo-copy-6beae556.base44.app)
-- ==============================================================================

-- 1. PLANS D'ABONNEMENT BASE44
INSERT INTO public.subscription_plans (name, slug, price, currency, duration_days, trip_limit, is_active, features)
VALUES ('Starter', 'starter_monthly', 0, 'XOF', 30, 3, true, '["Publication de trajets","Jusqu''à 3 trajets/mois","Support communautaire"]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, features = EXCLUDED.features;

INSERT INTO public.subscription_plans (name, slug, price, currency, duration_days, trip_limit, is_active, features)
VALUES ('Pro', 'pro_monthly', 5000, 'XOF', 30, -1, true, '["Trajets illimités","Badge Chauffeur vérifié prioritaire","Statistiques avancées","Support prioritaire"]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, features = EXCLUDED.features;

INSERT INTO public.subscription_plans (name, slug, price, currency, duration_days, trip_limit, is_active, features)
VALUES ('Premium', 'premium_monthly', 15000, 'XOF', 30, -1, true, '["Tout le pack Pro","Mise en avant des trajets","0% commission (lancement)","Account manager dédié"]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, features = EXCLUDED.features;

INSERT INTO public.subscription_plans (name, slug, price, currency, duration_days, trip_limit, is_active, features)
VALUES ('Pro Annuel', 'pro_yearly', 50000, 'XOF', 365, -1, true, '["Trajets illimités","Badge Chauffeur vérifié prioritaire","Statistiques avancées","2 mois offerts"]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, features = EXCLUDED.features;

INSERT INTO public.subscription_plans (name, slug, price, currency, duration_days, trip_limit, is_active, features)
VALUES ('Premium Annuel', 'premium_yearly', 150000, 'XOF', 365, -1, true, '["Tout le pack Premium","0% commission (lancement)","Account manager dédié","2 mois offerts"]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, features = EXCLUDED.features;


-- 2. TRAJETS BASE44 (12 Trajets réels)
-- Note: Ces trajets peuvent être insérés pour un chauffeur de démonstration ou existant
