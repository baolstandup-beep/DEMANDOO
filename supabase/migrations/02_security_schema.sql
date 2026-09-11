-- Migration de Sécurisation : Base de données & RLS (Row Level Security)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SUPPRESSION DES TABLES EXISTANTES (Pour réinitialiser le schéma proprement)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. CRÉATION DES TABLES
-- Table: Profiles (Étend la table auth.users de Supabase)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'passenger' CHECK (role IN ('passenger', 'driver', 'admin')),
    is_phone_verified BOOLEAN DEFAULT false,
    is_identity_verified BOOLEAN DEFAULT false,
    
    -- Driver Specific fields
    driver_status TEXT DEFAULT 'INCOMPLETE' CHECK (driver_status IN ('INCOMPLETE', 'PENDING', 'VERIFIED', 'REJECTED')),
    license_number TEXT,
    kyc_status TEXT DEFAULT 'pending',
    subscription_status TEXT DEFAULT 'inactive',
    subscription_trip_limit INTEGER DEFAULT 0,
    subscription_trips_used INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Trips (Trajets publiés par les chauffeurs)
CREATE TABLE trips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    departure_city TEXT NOT NULL,
    departure_address TEXT NOT NULL,
    arrival_city TEXT NOT NULL,
    arrival_address TEXT NOT NULL,
    departure_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    
    seats_total INTEGER NOT NULL CHECK (seats_total > 0),
    seats_available INTEGER NOT NULL CHECK (seats_available >= 0 AND seats_available <= seats_total),
    price_per_seat INTEGER NOT NULL CHECK (price_per_seat >= 0),
    
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Bookings (Réservations passagers)
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    seats_booked INTEGER NOT NULL CHECK (seats_booked > 0),
    total_price INTEGER NOT NULL,
    pickup_point TEXT,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ACTIVATION DE LA SÉCURITÉ RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 5. POLITIQUES RLS (ROW LEVEL SECURITY)

-- POLITIQUES: Profiles
-- Tout le monde peut lire les profils de base (pour afficher les noms/photos)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

-- Un utilisateur ne peut modifier que son PROPRE profil
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- POLITIQUES: Trips (Trajets)
-- Tout le monde peut voir les trajets
CREATE POLICY "Trips are viewable by everyone" ON trips
    FOR SELECT USING (true);

-- Seul le chauffeur propriétaire peut créer/modifier/supprimer ses trajets
CREATE POLICY "Drivers can insert their own trips" ON trips
    FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own trips" ON trips
    FOR UPDATE USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can delete their own trips" ON trips
    FOR DELETE USING (auth.uid() = driver_id);

-- POLITIQUES: Bookings (Réservations)
-- Un passager peut voir ses propres réservations
-- Un chauffeur peut voir les réservations liées à SES trajets
CREATE POLICY "Users can view relevant bookings" ON bookings
    FOR SELECT USING (
        auth.uid() = passenger_id OR 
        auth.uid() IN (SELECT driver_id FROM trips WHERE id = bookings.trip_id)
    );

-- Un passager peut créer une réservation pour lui-même
CREATE POLICY "Passengers can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = passenger_id);

-- Un chauffeur peut mettre à jour le statut d'une réservation (accepter/refuser) s'il est le proprio du trajet
-- Un passager peut annuler sa propre réservation
CREATE POLICY "Users can update relevant bookings" ON bookings
    FOR UPDATE USING (
        auth.uid() = passenger_id OR 
        auth.uid() IN (SELECT driver_id FROM trips WHERE id = bookings.trip_id)
    );

-- 6. TRIGGERS AUTOMATIQUES
-- Trigger pour insérer automatiquement un profil lors de la création d'un compte Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
