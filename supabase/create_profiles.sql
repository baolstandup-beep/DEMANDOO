-- ==========================================================
-- DEMANDOO
-- Création automatique des profils utilisateurs
-- Adapté pour correspondre à l'application React (role, driver_status, etc.)
-- ==========================================================

-- 1. TABLE DES PROFILS
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text,
  phone text,
  address text,

  role text not null default 'passenger'
    check (role in ('passenger', 'driver', 'admin')),

  avatar_url text,

  driver_status text default 'PENDING',
  is_driver_active boolean not null default false,
  kyc_status text default 'pending',
  license_number text,
  onboarding_completed boolean not null default false,

  -- Gestion des abonnements
  subscription_status text default 'none',
  subscription_trip_limit integer default 0,
  subscription_trips_used integer default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==========================================================
-- 2. ACTIVER RLS
-- ==========================================================
alter table public.profiles enable row level security;

-- ==========================================================
-- 3. SUPPRIMER LES ANCIENNES POLICIES SI ELLES EXISTENT
-- ==========================================================
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- ==========================================================
-- 4. LECTURE DU PROFIL
-- ==========================================================
create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
);

-- ==========================================================
-- 5. MODIFICATION DU PROFIL
-- ==========================================================
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) = id
)
with check (
  (select auth.uid()) = id
);

-- ==========================================================
-- 6. AUTORISATIONS DATA API
-- ==========================================================
grant select, update on table public.profiles to authenticated;

-- ==========================================================
-- 7. FONCTION DE CRÉATION AUTOMATIQUE DU PROFIL
-- ==========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_role text;
begin
  selected_role :=
    case
      when new.raw_user_meta_data ->> 'role' = 'driver'
        then 'driver'
      else 'passenger'
    end;

  insert into public.profiles (
    id,
    full_name,
    phone,
    address,
    role
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      coalesce(new.raw_user_meta_data ->> 'name', '')
    ),
    coalesce(
      new.raw_user_meta_data ->> 'phone',
      new.phone,
      ''
    ),
    coalesce(
      new.raw_user_meta_data ->> 'address',
      ''
    ),
    selected_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

-- ==========================================================
-- 8. TRIGGER AUTH
-- ==========================================================
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ==========================================================
-- 9. MISE À JOUR AUTOMATIQUE DE updated_at
-- ==========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();
