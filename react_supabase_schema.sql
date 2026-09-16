-- ==============================================================================
-- SCRIPT DE BASE DE DONNÉES OFFICIEL POUR L'APPLICATION REACT/VITE "DEMANDOO"
-- ==============================================================================

-- 1. Nettoyage des anciennes tables pour éviter les conflits
drop table if exists public.vehicles cascade;
drop table if exists public.driver_subscriptions cascade;
drop table if exists public.profiles cascade;

-- ==========================================
-- 2. TABLE DES PROFILS (CHAUFFEURS & PASSAGERS)
-- ==========================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  role text default 'passenger',
  driver_status text default 'INCOMPLETE',
  is_driver_active boolean default false,
  is_phone_verified boolean default false,
  is_identity_verified boolean default false,
  kyc_status text default 'pending',
  license_number text,
  subscription_status text,
  subscription_plan text,
  subscription_trip_limit int default 0,
  subscription_trips_used int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
create policy "Lecture de tous les profils" on public.profiles for select using (true);
create policy "Modification de son propre profil" on public.profiles for update using (auth.uid() = id);
create policy "Création de son propre profil" on public.profiles for insert with check (auth.uid() = id);

-- TRIGGER : Création automatique du profil lors de l'inscription Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone, role, driver_status)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'passenger'),
    case when coalesce(new.raw_user_meta_data->>'role', '') = 'driver' then 'PENDING' else 'INCOMPLETE' end
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 3. TABLE DES VÉHICULES
-- ==========================================
create table public.vehicles (
  id uuid default gen_random_uuid() primary key,
  driver_id uuid references public.profiles(id) on delete cascade not null,
  brand text,
  model text,
  year int,
  color text,
  license_plate text,
  seats int,
  vehicle_type text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.vehicles enable row level security;
create policy "Lecture publique des véhicules" on public.vehicles for select using (true);
create policy "Gestion de ses véhicules" on public.vehicles for all using (auth.uid() = driver_id);

-- ==========================================
-- 4. TABLE DES ABONNEMENTS CHAUFFEURS
-- ==========================================
create table public.driver_subscriptions (
  id uuid default gen_random_uuid() primary key,
  driver_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'active',
  trips_used int default 0,
  plan text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.driver_subscriptions enable row level security;
create policy "Lecture des abonnements" on public.driver_subscriptions for select using (true);
create policy "Gestion de ses abonnements" on public.driver_subscriptions for all using (auth.uid() = driver_id);

-- ==========================================
-- 5. FONCTION RPC POUR SIMULER LES PAIEMENTS
-- ==========================================
create or replace function public.mock_payment_webhook(p_transaction_id text, p_driver_id uuid, p_plan text, p_amount int)
returns void as $$
begin
  insert into public.driver_subscriptions (driver_id, plan, status, trips_used)
  values (p_driver_id, p_plan, 'active', 0);
  
  update public.profiles 
  set subscription_status = 'active', subscription_plan = p_plan
  where id = p_driver_id;
end;
$$ language plpgsql security definer;

-- ==========================================
-- 6. TABLE DES TRAJETS (TRIPS)
-- ==========================================
create table public.trips (
  id uuid default gen_random_uuid() primary key,
  driver_id uuid references public.profiles(id) on delete cascade not null,
  departure_city text not null,
  arrival_city text not null,
  departure_datetime timestamp with time zone not null,
  departure_address text,
  arrival_address text,
  price_per_seat int not null,
  seats_total int not null,
  seats_available int not null,
  status text default 'scheduled',
  payment_method text default 'CASH',
  rules jsonb default '{}'::jsonb,
  cancellation_policy text,
  vehicle_details jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.trips enable row level security;
create policy "Lecture publique des trajets" on public.trips for select using (true);
create policy "Gestion de ses trajets" on public.trips for all using (auth.uid() = driver_id);

-- ==========================================
-- 7. TABLE DES RESERVATIONS (BOOKINGS)
-- ==========================================
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  passenger_id uuid references public.profiles(id) on delete cascade not null,
  seats_booked int default 1,
  total_price int not null,
  pickup_point text,
  status text default 'pending',
  rejection_reason text,
  passenger_info jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bookings enable row level security;
create policy "Lecture de ses reservations passager" on public.bookings for select using (auth.uid() = passenger_id);
-- Les chauffeurs peuvent lire les réservations de leurs trajets
create policy "Lecture de ses reservations chauffeur" on public.bookings for select using (
  auth.uid() in (select driver_id from public.trips where id = trip_id)
);
create policy "Creation de reservations" on public.bookings for insert with check (auth.uid() = passenger_id);
-- Le chauffeur peut modifier le statut
create policy "Modification de ses reservations chauffeur" on public.bookings for update using (
  auth.uid() in (select driver_id from public.trips where id = trip_id)
);
create policy "Modification de ses reservations passager" on public.bookings for update using (auth.uid() = passenger_id);

-- ==========================================
-- 8. TABLE DES AVIS (REVIEWS)
-- ==========================================
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  reviewee_id uuid references public.profiles(id) on delete cascade not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;
create policy "Lecture publique des avis" on public.reviews for select using (true);
create policy "Creation des avis" on public.reviews for insert with check (auth.uid() = reviewer_id);
