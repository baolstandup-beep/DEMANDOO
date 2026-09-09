-- Demandoo Senegal Database Schema & Row Level Security (RLS)
-- Target Engine: Supabase / PostgreSQL 15+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================
-- 1. PROFILES / USERS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'passenger' CHECK (role IN ('passenger', 'driver', 'admin')),
  driver_status TEXT NOT NULL DEFAULT 'INCOMPLETE' CHECK (driver_status IN ('INCOMPLETE', 'PENDING_VERIFICATION', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_identity_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- 2. DRIVER PROFILES (KYC Core)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.driver_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  date_of_birth DATE,
  city TEXT,
  verification_progress INT DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  rating NUMERIC(3,2) DEFAULT 5.0,
  total_trips INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- 3. VEHICLES
-- ===================================================
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  color TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  seats INT NOT NULL DEFAULT 4,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- 4. DRIVER DOCUMENTS (KYC Pieces)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.driver_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('cni_front', 'cni_back', 'selfie', 'license', 'vehicle_registration', 'vehicle_insurance', 'vehicle_front', 'vehicle_back', 'vehicle_interior')),
  file_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'UPLOADED' CHECK (status IN ('MISSING', 'UPLOADED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
  rejection_reason TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  UNIQUE(driver_id, document_type)
);

-- ===================================================
-- 5. DRIVER VERIFICATION LOGS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.driver_verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  admin_id UUID REFERENCES public.profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- 6. TRIPS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  departure_city TEXT NOT NULL,
  departure_address TEXT NOT NULL,
  arrival_city TEXT NOT NULL,
  arrival_address TEXT NOT NULL,
  departure_datetime TIMESTAMPTZ NOT NULL,
  estimated_duration TEXT NOT NULL DEFAULT '2h30',
  seats_total INT NOT NULL DEFAULT 4,
  seats_available INT NOT NULL DEFAULT 4,
  price_per_seat INT NOT NULL CHECK (price_per_seat > 0),
  vehicle_id UUID REFERENCES public.vehicles(id),
  rules_luggage TEXT DEFAULT 'Sacs de taille moyenne autorisés',
  rules_pets BOOLEAN DEFAULT FALSE,
  rules_smoking BOOLEAN DEFAULT FALSE,
  cancellation_policy TEXT DEFAULT 'Flexible: Annulation gratuite jusqu\'à 24h avant le départ',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- 7. BOOKINGS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seats_booked INT NOT NULL DEFAULT 1 CHECK (seats_booked > 0),
  total_price INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pending_payment', 'payment_processing', 'paid', 'confirmed', 'rejected', 'cancelled', 'completed', 'refunded')),
  pickup_point TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- 8. PAYMENTS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('wave', 'orange_money', 'ligdicash')),
  provider_reference TEXT UNIQUE,
  amount INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- ===================================================
-- 9. NOTIFICATIONS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read public info
CREATE POLICY "Public profiles view" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Driver Profiles:
CREATE POLICY "Public driver profiles view" ON public.driver_profiles FOR SELECT USING (true);
CREATE POLICY "Drivers can update own profile" ON public.driver_profiles FOR UPDATE USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Drivers can insert own profile" ON public.driver_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- Driver Documents: Drivers can only see/insert/update their own, admins can do all
CREATE POLICY "Drivers see own docs" ON public.driver_documents FOR SELECT USING (
  driver_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Drivers insert own docs" ON public.driver_documents FOR INSERT WITH CHECK (
  driver_id = auth.uid()
);
CREATE POLICY "Drivers update own docs" ON public.driver_documents FOR UPDATE USING (
  driver_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Driver Logs: Only Admins can insert. Drivers can only view their own logs
CREATE POLICY "Drivers view own logs" ON public.driver_verification_logs FOR SELECT USING (
  driver_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins insert logs" ON public.driver_verification_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Trips: Only APPROVED drivers can insert trips (checked in application code too, but enforced here)
CREATE POLICY "Public trips view" ON public.trips FOR SELECT USING (status = 'scheduled');
CREATE POLICY "Approved Drivers insert trips" ON public.trips FOR INSERT WITH CHECK (
  driver_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND driver_status = 'APPROVED')
);

-- Function & Trigger to lock seats atomically upon confirmed booking
CREATE OR REPLACE FUNCTION update_trip_seats()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status = 'paid' OR NEW.status = 'confirmed') AND (OLD.status IS NULL OR OLD.status NOT IN ('paid', 'confirmed')) THEN
    UPDATE public.trips
    SET seats_available = seats_available - NEW.seats_booked
    WHERE id = NEW.trip_id AND seats_available >= NEW.seats_booked;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Plus de places disponibles pour ce trajet.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_update_trip_seats
AFTER UPDATE OF status ON public.bookings
FOR EACH ROW EXECUTE FUNCTION update_trip_seats();

-- ===================================================
-- STORAGE BUCKETS (Pseudo-code for Supabase Dashboard)
-- ===================================================
-- insert into storage.buckets (id, name, public) values ('driver-documents', 'driver-documents', false);
-- CREATE POLICY "Drivers can upload own docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'driver-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
-- CREATE POLICY "Drivers can view own docs" ON storage.objects FOR SELECT USING (bucket_id = 'driver-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
-- CREATE POLICY "Admins can view all docs" ON storage.objects FOR SELECT USING (bucket_id = 'driver-documents' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
