-- SQL Migration: Subscription system and quotas

-- 1. Ensure `profiles` table has the necessary fields (they might already exist, but we add if missing)
DO $$ 
BEGIN
  -- Add fields if they don't exist
  BEGIN
    ALTER TABLE public.profiles ADD COLUMN payment_reference TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL; END;

  BEGIN
    ALTER TABLE public.profiles ADD COLUMN last_payment_at TIMESTAMPTZ;
  EXCEPTION WHEN duplicate_column THEN NULL; END;

  BEGIN
    ALTER TABLE public.profiles ADD COLUMN next_renewal_at TIMESTAMPTZ;
  EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

-- 2. Function to check subscription limits before inserting a trip
CREATE OR REPLACE FUNCTION check_trip_publish_quota()
RETURNS TRIGGER AS $$
DECLARE
    v_plan TEXT;
    v_status TEXT;
    v_trips_used INTEGER;
    v_trip_limit INTEGER;
BEGIN
    -- Fetch current subscription details for the driver from `profiles`
    SELECT 
        COALESCE(subscription_plan, 'trial'),
        COALESCE(subscription_status, 'inactive'),
        COALESCE(subscription_trips_used, 0),
        subscription_trip_limit
    INTO 
        v_plan, 
        v_status, 
        v_trips_used, 
        v_trip_limit
    FROM public.profiles 
    WHERE id = NEW.driver_id;

    -- Check if subscription is expired or inactive
    IF v_status = 'expired' OR v_status = 'inactive' THEN
        -- Allow if it's the very first 'trial' (découverte) trip and they haven't published anything yet
        IF v_plan = 'trial' AND v_trips_used = 0 THEN
            -- we allow it this one time
            NULL;
        ELSE
            RAISE EXCEPTION 'Abonnement expiré ou inactif. Veuillez renouveler votre abonnement.';
        END IF;
    END IF;

    -- Check limits based on plan
    IF v_plan = 'trial' THEN
        IF v_trips_used >= 1 THEN
            RAISE EXCEPTION 'Limite atteinte. Vous avez utilisé votre trajet découverte.';
        END IF;
    ELSIF v_plan = 'standard' THEN
        IF v_trips_used >= 4 THEN
            RAISE EXCEPTION 'Limite atteinte. Vous avez utilisé vos 4 publications disponibles pour cette période.';
        END IF;
    ELSIF v_plan = 'pro' THEN
        -- No limits for pro
        NULL;
    END IF;

    -- Check numeric trip_limit if it's set as a safeguard (fallback)
    IF v_plan != 'pro' AND v_trip_limit IS NOT NULL AND v_trips_used >= v_trip_limit THEN
        RAISE EXCEPTION 'Limite de trajets atteinte (%).', v_trip_limit;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger before insert on trips
DROP TRIGGER IF EXISTS enforce_trip_publish_quota ON public.trips;
CREATE TRIGGER enforce_trip_publish_quota
BEFORE INSERT ON public.trips
FOR EACH ROW
EXECUTE FUNCTION check_trip_publish_quota();


-- 4. Function to increment `trips_used` after successful insertion
CREATE OR REPLACE FUNCTION increment_trips_used()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET subscription_trips_used = COALESCE(subscription_trips_used, 0) + 1
    WHERE id = NEW.driver_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger after insert on trips
DROP TRIGGER IF EXISTS after_trip_insert_increment_quota ON public.trips;
CREATE TRIGGER after_trip_insert_increment_quota
AFTER INSERT ON public.trips
FOR EACH ROW
EXECUTE FUNCTION increment_trips_used();

-- 6. Deny direct updates to sensitive fields by users on `profiles`
-- This can be done by adjusting RLS, but Supabase allows updating own profile.
-- We can add a BEFORE UPDATE trigger to prevent overriding subscription fields by non-admins.
CREATE OR REPLACE FUNCTION protect_subscription_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- If the user is NOT an admin (checked via auth.jwt() role or some internal check)
    -- In Supabase, the best way is to ensure NEW fields equal OLD fields for sensitive columns,
    -- unless the query is executed by a service_role (backend).
    
    -- Check if the current role is 'authenticated' (i.e. the frontend user)
    IF current_user = 'authenticated' THEN
        -- Force sensitive fields to remain unchanged by the user
        NEW.subscription_plan = OLD.subscription_plan;
        NEW.subscription_status = OLD.subscription_status;
        NEW.subscription_trip_limit = OLD.subscription_trip_limit;
        NEW.subscription_trips_used = OLD.subscription_trips_used;
        NEW.payment_reference = OLD.payment_reference;
        NEW.last_payment_at = OLD.last_payment_at;
        NEW.next_renewal_at = OLD.next_renewal_at;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_profile_security ON public.profiles;
CREATE TRIGGER enforce_profile_security
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION protect_subscription_fields();

-- 7. Mock Webhook RPC (for frontend testing without Deno Edge Functions)
CREATE OR REPLACE FUNCTION mock_payment_webhook(p_transaction_id TEXT, p_driver_id UUID, p_plan TEXT, p_amount INTEGER)
RETURNS JSONB AS $$
DECLARE
    v_trip_limit INTEGER;
    v_existing_payment UUID;
BEGIN
    -- Check idempotency
    SELECT id INTO v_existing_payment FROM public.payments WHERE provider_transaction_id = p_transaction_id;
    IF v_existing_payment IS NOT NULL THEN
        RETURN '{"status": "already_processed"}'::JSONB;
    END IF;

    -- Insert payment
    INSERT INTO public.payments (driver_id, provider, provider_transaction_id, amount, status, confirmed_at)
    VALUES (p_driver_id, 'mock_wave', p_transaction_id, p_amount, 'paid', NOW());

    -- Determine limits
    IF p_plan = 'standard' THEN
        v_trip_limit := 4;
    ELSIF p_plan = 'pro' THEN
        v_trip_limit := 999999;
    ELSE
        v_trip_limit := 1;
    END IF;

    -- Update Profile (Runs as SECURITY DEFINER so it bypasses the authenticated check in the trigger)
    UPDATE public.profiles
    SET 
        subscription_plan = p_plan,
        subscription_status = 'active',
        subscription_trips_used = 0,
        subscription_trip_limit = v_trip_limit,
        payment_reference = p_transaction_id,
        last_payment_at = NOW(),
        next_renewal_at = NOW() + INTERVAL '1 month'
    WHERE id = p_driver_id;

    RETURN '{"status": "success"}'::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
