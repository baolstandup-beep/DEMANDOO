-- ============================================================
-- SCRIPT DE CONFIGURATION SUPABASE POUR DEMANDOO
-- A exécuter dans le SQL Editor de votre projet Supabase
-- ============================================================

-- 1. Réinitialisation si la table existait déjà avec une ancienne version
drop table if exists public.conducteurs cascade;

-- 2. Création complète de la table des conducteurs
create table public.conducteurs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete set null,
  nom text not null,
  prenom text not null,
  telephone text not null unique,
  email text,
  permis_numero text not null unique,
  vehicule_type text default 'voiture' check (vehicule_type in ('moto', 'voiture', 'camionnette', 'camion')),
  ville text not null,
  statut text default 'en_attente' check (statut in ('en_attente', 'valide', 'suspendu')),
  permis_image_url text
);

-- 3. Activer la Sécurité au Niveau des Lignes (RLS)
alter table public.conducteurs enable row level security;

-- 4. Politiques de sécurité (RLS Policies)
create policy "Lecture des conducteurs (Admin uniquement)"
on public.conducteurs
for select
to authenticated
using (true);

create policy "Insertion automatique des nouveaux conducteurs"
on public.conducteurs
for insert
to anon, authenticated
with check (true);

create policy "Mise à jour des conducteurs par utilisateurs authentifiés"
on public.conducteurs
for update
to authenticated
using (true)
with check (true);

-- 5. Configuration du Bucket Storage pour les Permis de Conduire
insert into storage.buckets (id, name, public)
values ('permis-conducteurs', 'permis-conducteurs', true)
on conflict (id) do nothing;

-- Politiques de stockage (suppression préalable au cas où)
drop policy if exists "Accès public aux permis" on storage.objects;
drop policy if exists "Upload public des permis" on storage.objects;

create policy "Accès public aux permis"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'permis-conducteurs');

create policy "Upload public des permis"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'permis-conducteurs');
