-- ==========================================
-- TradeX SaaS - Complete Database Setup (Unified v2)
-- Includes: Tables, Migrations, RLS, Triggers, RPCs, Indexes, Permissions
-- FIXES: Saves password in public.users to enable Admin Demo Login
-- ==========================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. CLEANUP (Safe Drops)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.create_demo_merchandiser(text, text, text, text);
drop function if exists public.login_demo_user(text, text);

-- 3. TABLES & MIGRATIONS

-- USERS
create table if not exists public.users (
  id text primary key,
  name text,
  email text,
  password text, -- Crucial for Demo RPC login
  phone text,
  zone text,
  role text check (role in ('MERCHANDISER', 'MANAGER', 'ADMIN', 'SUPERVISOR')),
  active boolean default true,
  avatar_url text,
  manager_id text references public.users(id),
  created_at timestamptz default now()
);

-- STORES
create table if not exists public.stores (
  id text primary key,
  name text not null,
  address text,
  lat double precision,
  lng double precision,
  owner_id text references public.users(id),
  created_at timestamptz default now()
);

-- PRODUCTS
create table if not exists public.products (
  id text primary key,
  brand text,
  sku text,
  name text,
  price numeric,
  stock integer,
  facing integer,
  owner_id text references public.users(id),
  created_at timestamptz default now()
);

-- VISITS
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
  rupture_items jsonb,
  owner_id text references public.users(id),
  created_at timestamptz default now()
);

-- TASKS
create table if not exists public.tasks (
  id text primary key,
  visit_id text references public.visits(id) on delete cascade,
  type text check (type in ('PHOTO', 'FORM', 'INVENTORY')),
  title text,
  completed boolean default false,
  required boolean default false,
  data jsonb,
  created_at timestamptz default now()
);

-- LEADS
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  company text,
  role text,
  plan_interest text,
  created_at timestamptz default now()
);

-- 4. INDEXES
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_manager_id on public.users(manager_id);
create index if not exists idx_visits_owner_id on public.visits(owner_id);
create index if not exists idx_visits_merchandiser_id on public.visits(merchandiser_id);
create index if not exists idx_stores_owner_id on public.stores(owner_id);
create index if not exists idx_leads_email on public.leads(email);

-- 5. PERMISSIONS
grant usage on schema public to anon, authenticated, service_role;
grant all on public.users to service_role;
grant select on public.users to anon, authenticated;
grant insert, update on public.users to authenticated, service_role;
grant insert on public.leads to anon, authenticated, service_role;

-- 6. ROW LEVEL SECURITY (RLS)
alter table public.users enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.visits enable row level security;
alter table public.tasks enable row level security;
alter table public.leads enable row level security;

-- USERS POLICIES
drop policy if exists "Users can view own profile and subordinates" on public.users;
create policy "Users can view own profile and subordinates" on public.users 
for select using ( auth.uid()::text = id OR manager_id = auth.uid()::text );

-- STORES POLICIES
drop policy if exists "Manager can view own stores" on public.stores;
create policy "Manager can view own stores" on public.stores
for select using ( owner_id = auth.uid()::text OR owner_id = (select manager_id from public.users where id = auth.uid()::text) );

drop policy if exists "Manager can insert own stores" on public.stores;
create policy "Manager can insert own stores" on public.stores
for insert with check ( auth.uid()::text = owner_id );

drop policy if exists "Manager can update own stores" on public.stores;
create policy "Manager can update own stores" on public.stores
for update using ( auth.uid()::text = owner_id );

drop policy if exists "Manager can delete own stores" on public.stores;
create policy "Manager can delete own stores" on public.stores
for delete using ( auth.uid()::text = owner_id );

-- PRODUCTS POLICIES
drop policy if exists "Manager can view own products" on public.products;
create policy "Manager can view own products" on public.products
for select using ( owner_id = auth.uid()::text OR owner_id = (select manager_id from public.users where id = auth.uid()::text) );

drop policy if exists "Manager can insert own products" on public.products;
create policy "Manager can insert own products" on public.products
for insert with check ( auth.uid()::text = owner_id );

-- VISITS POLICIES
drop policy if exists "Manager and Merch can view visits" on public.visits;
create policy "Manager and Merch can view visits" on public.visits
for select using ( owner_id = auth.uid()::text OR merchandiser_id = auth.uid()::text );

drop policy if exists "Manager can insert visits" on public.visits;
create policy "Manager can insert visits" on public.visits
for insert with check ( auth.uid()::text = owner_id );

drop policy if exists "Merch can update assigned visits" on public.visits;
create policy "Merch can update assigned visits" on public.visits
for update using ( owner_id = auth.uid()::text OR merchandiser_id = auth.uid()::text );

-- TASKS POLICIES
drop policy if exists "Access tasks via visit" on public.tasks;
create policy "Access tasks via visit" on public.tasks
for all using ( exists ( select 1 from public.visits v where v.id = tasks.visit_id and (v.owner_id = auth.uid()::text OR v.merchandiser_id = auth.uid()::text) ) );

-- LEADS POLICIES
drop policy if exists "Allow public insert leads" on public.leads;
create policy "Allow public insert leads" on public.leads for insert with check (true);

-- STORAGE
insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict (id) do nothing;
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select using ( bucket_id = 'photos' );
drop policy if exists "Authenticated Upload" on storage.objects;
create policy "Authenticated Upload" on storage.objects for insert with check ( bucket_id = 'photos' and auth.role() = 'authenticated' );

-- 7. TRIGGERS & FUNCTIONS (FIXED)

-- Handle New User (The Fix: Saves Password)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Aggressively delete any existing user profile with this email but different ID
  begin
    delete from public.users where email = new.email and id <> new.id;
  exception when others then null;
  end;

  insert into public.users (id, email, name, role, active, zone, phone, password, created_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    coalesce(new.raw_user_meta_data->>'role', 'SUPERVISOR'),
    true,
    coalesce(new.raw_user_meta_data->>'zone', 'Global'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'password', -- FIX: Save password for RPC login
    coalesce(new.created_at, now())
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    role = excluded.role,
    phone = excluded.phone,
    password = excluded.password,
    created_at = excluded.created_at;
    
  return new;
exception when others then
  raise exception 'Trigger Failed: %', SQLERRM;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create Demo Merchandiser RPC
create or replace function public.create_demo_merchandiser(
  manager_email text,
  merch_password text,
  manager_name text,
  manager_phone text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id text;
  merch_email text;
  mgr_id text;
begin
  -- Normalize email for lookup
  select id into mgr_id from public.users where lower(trim(email)) = lower(trim(manager_email));
  
  if mgr_id is null then
    raise exception 'Manager not found for email: %', manager_email;
  end if;

  new_id := gen_random_uuid()::text;
  merch_email := 'mobile.' || manager_email;

  insert into public.users (id, email, name, password, role, active, zone, phone, manager_id)
  values (
    new_id,
    merch_email,
    'Merch ' || manager_name,
    merch_password,
    'MERCHANDISER',
    true,
    'Terrain',
    manager_phone,
    mgr_id
  );

  return json_build_object('id', new_id, 'email', merch_email);
end;
$$;

grant execute on function public.create_demo_merchandiser to anon, authenticated, service_role;

-- Login Demo User RPC
create or replace function public.login_demo_user(
  email_input text,
  password_input text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  found_user record;
begin
  select * into found_user from public.users 
  where lower(trim(email)) = lower(trim(email_input))
  and password = password_input -- Password is case sensitive
  limit 1;

  if found_user.id is not null then
    return json_build_object(
      'id', found_user.id,
      'email', found_user.email,
      'role', found_user.role,
      'name', found_user.name,
      'zone', found_user.zone
    );
  else
    return null;
  end if;
end;
$$;

grant execute on function public.login_demo_user to anon, authenticated, service_role;

-- 9. VERIFICATION
select count(*) as users_count from public.users;
