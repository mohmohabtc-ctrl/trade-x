-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. TABLES (IF NOT EXISTS)
create table if not exists public.stores (
  id text primary key,
  name text not null,
  address text,
  lat double precision,
  lng double precision
);

create table if not exists public.products (
  id text primary key,
  brand text,
  sku text,
  name text,
  price numeric,
  stock integer,
  facing integer
);

create table if not exists public.users (
  id text primary key,
  name text,
  email text unique,
  password text,
  phone text,
  zone text,
  role text check (role in ('MERCHANDISER', 'MANAGER', 'ADMIN', 'SUPERVISOR')),
  active boolean default true,
  avatar_url text
);

create table if not exists public.visits (
  id text primary key,
  merchandiser_id text references public.users(id),
  store_id text references public.stores(id),
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  status text check (status in ('TODO', 'IN_PROGRESS', 'COMPLETED', 'LATE')),
  check_in_time timestamptz,
  check_out_time timestamptz,
  dlc text,
  veille text,
  rupture text,
  photo_avant text,
  photo_apres text,
  rupture_items jsonb
);

create table if not exists public.tasks (
  id text primary key,
  visit_id text references public.visits(id) on delete cascade,
  type text check (type in ('PHOTO', 'FORM', 'INVENTORY')),
  title text,
  completed boolean default false,
  required boolean default false,
  data jsonb
);

create table if not exists public.leads (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  phone text,
  company text,
  role text,
  created_at timestamptz default now()
);

-- 2. SEED DATA (ON CONFLICT DO NOTHING)
insert into public.stores (id, name, address, lat, lng) values
('s1', 'Carrefour Market', '12 Rue de la Paix, Paris', 48.86, 2.33),
('s2', 'Monoprix', '55 Avenue des Champs, Paris', 48.87, 2.30),
('s3', 'Franprix', '145 Bd Saint-Germain, Paris', 48.85, 2.33),
('s4', 'Super U', '22 Rue Montorgueil, Paris', 48.86, 2.34)
on conflict (id) do nothing;

insert into public.products (id, brand, sku, name, price, stock, facing) values
('p1', 'Coca-Cola', 'COCA-1.5L', 'Coca-Cola Original 1.5L', 120, 50, 4),
('p2', 'Coca-Cola', 'COCA-33CL', 'Coca-Cola Canette 33cl', 60, 100, 6),
('p3', 'Candia', 'CANDIA-1L', 'Lait Candia Demi-Ecrémé 1L', 95, 200, 10),
('p4', 'Ramy', 'RAMY-JUS-1L', 'Jus Ramy Orange 1L', 130, 40, 3)
on conflict (id) do nothing;

insert into public.users (id, name, email, password, phone, zone, role, active) values
('m1', 'Ali', 'ali@merchfield.com', '123', '0550 12 34 56', 'Alger Centre', 'MERCHANDISER', true),
('m2', 'Sara', 'sara@merchfield.com', '123', '0551 98 76 54', 'Alger Est', 'MERCHANDISER', true),
('m3', 'Amine', 'amine@merchfield.com', '123', '0552 22 33 44', 'Reghaia', 'MERCHANDISER', true),
('m4', 'Djamel', 'djamel@merchfield.com', '123', '0553 44 55 66', 'Hussein Dey', 'MERCHANDISER', true),
('mgr1', 'Sophie', 'sophie@raya.dz', '123', null, 'Région Nord', 'SUPERVISOR', true)
on conflict (id) do nothing;

insert into public.visits (id, merchandiser_id, store_id, scheduled_start, scheduled_end, status, check_in_time, check_out_time) values
('v1', 'm1', 's1', now() - interval '2 hours', now() - interval '1 hour', 'COMPLETED', now() - interval '1 hour 55 minutes', now() - interval '1 hour 5 minutes'),
('v2', 'm2', 's2', now() - interval '30 minutes', now() + interval '30 minutes', 'IN_PROGRESS', now() - interval '25 minutes', null),
('v3', 'm3', 's3', now() + interval '2 hours', now() + interval '3 hours', 'TODO', null, null),
('v4', 'm4', 's4', now() + interval '4 hours', now() + interval '5 hours', 'LATE', null, null)
on conflict (id) do nothing;

insert into public.tasks (id, visit_id, type, title, completed, required) values
('t1', 'v1', 'PHOTO', 'Photo Rayon Boissons', true, true),
('t2', 'v1', 'FORM', 'Relevé Promo', true, true),
('t3', 'v2', 'INVENTORY', 'Inventaire Cola 1.5L', false, true),
('t4', 'v2', 'PHOTO', 'Photo Tête de Gondole', false, false)
on conflict (id) do nothing;

-- 3. STORAGE (Robust)
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Policies (Drop first to avoid error if exists)
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'photos' );

drop policy if exists "Authenticated Upload" on storage.objects;
create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'photos' and auth.role() = 'anon' );

-- 4. LEADS POLICIES
alter table public.leads enable row level security;

drop policy if exists "Allow public insert" on public.leads;
create policy "Allow public insert"
  on public.leads
  for insert
  with check (true);
