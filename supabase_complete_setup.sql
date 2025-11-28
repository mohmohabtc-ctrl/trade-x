-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. TABLES & MIGRATIONS
-- ==========================================

create table if not exists public.users (
  id text primary key,
  name text,
  email text,
  password text,
  phone text,
  zone text,
  role text check (role in ('MERCHANDISER', 'MANAGER', 'ADMIN', 'SUPERVISOR')),
  active boolean default true,
  avatar_url text,
  created_at timestamptz default now()
);

-- Add manager_id if it doesn't exist (Migration)
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'manager_id') then
    alter table public.users add column manager_id text references public.users(id);
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'created_at') then
    alter table public.users add column created_at timestamptz default now();
  end if;
end $$;


create table if not exists public.stores (
  id text primary key,
  name text not null,
  address text,
  lat double precision,
  lng double precision
);

-- Add owner_id to stores
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'stores' and column_name = 'owner_id') then
    alter table public.stores add column owner_id text references public.users(id);
  end if;
end $$;


create table if not exists public.products (
  id text primary key,
  brand text,
  sku text,
  name text,
  price numeric,
  stock integer,
  facing integer
);

-- Add owner_id to products
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'owner_id') then
    alter table public.products add column owner_id text references public.users(id);
  end if;
end $$;


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

-- Add owner_id to visits
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'visits' and column_name = 'owner_id') then
    alter table public.visits add column owner_id text references public.users(id);
  end if;
end $$;


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

-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================

-- Enable RLS on all tables
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.users enable row level security;
alter table public.visits enable row level security;
alter table public.tasks enable row level security;
alter table public.leads enable row level security;

-- --- USERS POLICIES ---
drop policy if exists "Users can view own profile and subordinates" on public.users;
drop policy if exists "Allow public read users" on public.users; -- DROP LEGACY
create policy "Users can view own profile and subordinates" on public.users 
for select using ( 
  auth.uid()::text = id 
  OR manager_id = auth.uid()::text 
);

-- --- STORES POLICIES ---
drop policy if exists "Manager can view own stores" on public.stores;
drop policy if exists "Enable read access for all users" on public.stores; -- DROP LEGACY
create policy "Manager can view own stores" on public.stores
for select using (
  owner_id = auth.uid()::text
  OR 
  -- Merchandisers can see stores owned by their manager
  owner_id = (select manager_id from public.users where id = auth.uid()::text)
);

drop policy if exists "Manager can insert own stores" on public.stores;
drop policy if exists "Enable insert for authenticated users only" on public.stores; -- DROP LEGACY
create policy "Manager can insert own stores" on public.stores
for insert with check (
  auth.uid()::text = owner_id
);

drop policy if exists "Manager can update own stores" on public.stores;
drop policy if exists "Enable update for authenticated users only" on public.stores; -- DROP LEGACY
create policy "Manager can update own stores" on public.stores
for update using (
  owner_id = auth.uid()::text
);

drop policy if exists "Manager can delete own stores" on public.stores;
drop policy if exists "Enable delete for authenticated users only" on public.stores; -- DROP LEGACY
create policy "Manager can delete own stores" on public.stores
for delete using (
  owner_id = auth.uid()::text
);

-- --- PRODUCTS POLICIES ---
drop policy if exists "Manager can view own products" on public.products;
drop policy if exists "Enable read access for all users" on public.products; -- DROP LEGACY
create policy "Manager can view own products" on public.products
for select using (
  owner_id = auth.uid()::text
  OR 
  -- Merchandisers can see products owned by their manager
  owner_id = (select manager_id from public.users where id = auth.uid()::text)
);

drop policy if exists "Manager can insert own products" on public.products;
drop policy if exists "Enable insert for authenticated users only" on public.products; -- DROP LEGACY
create policy "Manager can insert own products" on public.products
for insert with check (
  auth.uid()::text = owner_id
);

-- --- VISITS POLICIES ---
drop policy if exists "Manager and Merch can view visits" on public.visits;
drop policy if exists "Enable all access for authenticated users" on public.visits; -- DROP LEGACY
create policy "Manager and Merch can view visits" on public.visits
for select using (
  owner_id = auth.uid()::text -- Manager
  OR 
  merchandiser_id = auth.uid()::text -- Merchandiser
);

drop policy if exists "Manager can insert visits" on public.visits;
create policy "Manager can insert visits" on public.visits
for insert with check (
  auth.uid()::text = owner_id
);

drop policy if exists "Merch can update assigned visits" on public.visits;
create policy "Merch can update assigned visits" on public.visits
for update using (
  owner_id = auth.uid()::text -- Manager
  OR 
  merchandiser_id = auth.uid()::text -- Merchandiser
);

-- --- TASKS POLICIES ---
drop policy if exists "Access tasks via visit" on public.tasks;
drop policy if exists "Enable all access for authenticated users" on public.tasks; -- DROP LEGACY
create policy "Access tasks via visit" on public.tasks
for all using (
  exists (
    select 1 from public.visits v 
    where v.id = tasks.visit_id 
    and (v.owner_id = auth.uid()::text OR v.merchandiser_id = auth.uid()::text)
  )
);

-- --- LEADS POLICIES ---
drop policy if exists "Allow public insert leads" on public.leads;
create policy "Allow public insert leads" on public.leads for insert with check (true);

-- ==========================================
-- 3. STORAGE
-- ==========================================

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select using ( bucket_id = 'photos' );

drop policy if exists "Authenticated Upload" on storage.objects;
create policy "Authenticated Upload" on storage.objects for insert with check ( bucket_id = 'photos' and auth.role() = 'authenticated' );

-- ==========================================
-- 4. TRIGGERS (AUTH INTEGRATION)
-- ==========================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Aggressively delete any existing user profile with this email but different ID
  begin
    delete from public.users where email = new.email and id <> new.id;
  exception when others then null;
  end;

  insert into public.users (id, email, name, role, active, zone, phone, created_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    coalesce(new.raw_user_meta_data->>'role', 'SUPERVISOR'),
    true,
    coalesce(new.raw_user_meta_data->>'zone', 'Global'),
    new.raw_user_meta_data->>'phone',
    coalesce(new.created_at, now())
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    role = excluded.role,
    phone = excluded.phone,
    created_at = excluded.created_at;
    
  return new;
exception when others then
  raise exception 'Trigger Failed: %', SQLERRM;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 5. RPC FUNCTIONS (DEMO & HELPERS)
-- ==========================================

-- Function to create a demo merchandiser linked to a manager's email
-- This allows creating a user in public.users WITHOUT Supabase Auth, 
-- enabling the "fallback" login mechanism in App.tsx to work for the demo.

create or replace function public.create_demo_merchandiser(
  manager_email text,
  merch_password text,
  manager_name text,
  manager_phone text
)
returns json
language plpgsql
security definer -- Runs with admin privileges to bypass RLS
as $$
declare
  new_id text;
  merch_email text;
  mgr_id text;
begin
  -- Find the manager's ID
  select id into mgr_id from public.users where email = manager_email;
  
  if mgr_id is null then
    raise exception 'Manager not found';
  end if;

  -- Generate a pseudo-random ID or use UUID
  new_id := uuid_generate_v4()::text;
  
  -- Create a fake email for the merchandiser
  merch_email := 'mobile.' || manager_email;

  insert into public.users (id, email, name, password, role, active, zone, phone, manager_id)
  values (
    new_id,
    merch_email,
    'Merch ' || manager_name,
    merch_password, -- Storing plain text password for DEMO ONLY
    'MERCHANDISER',
    true,
    'Terrain',
    manager_phone,
    mgr_id -- Link to Manager
  );

  return json_build_object(
    'id', new_id,
    'email', merch_email
  );
end;
$$;
