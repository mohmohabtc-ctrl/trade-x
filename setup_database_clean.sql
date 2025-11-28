-- ==========================================
-- TRADEX - COMPLETE DATABASE SETUP (UNIFIED & CLEANED)
-- Run this entire script in Supabase SQL Editor
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CLEANUP & PREP
-- ==========================================

-- Drop potential blocking constraints on users.email
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'users' 
    AND constraint_type = 'UNIQUE'
    AND table_schema = 'public'
  ) LOOP
    EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT ' || quote_ident(r.constraint_name);
  END LOOP;
END $$;

-- Drop any conflicting triggers on leads table
DO $$
DECLARE
  trg_name TEXT;
BEGIN
  FOR trg_name IN 
    SELECT trigger_name 
    FROM information_schema.triggers 
    WHERE event_object_table = 'leads' 
    AND event_object_schema = 'public'
  LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(trg_name) || ' ON public.leads CASCADE';
  END LOOP;
END $$;

-- ==========================================
-- 2. CREATE TABLES
-- ==========================================

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  password TEXT,
  phone TEXT,
  zone TEXT,
  role TEXT CHECK (role IN ('MERCHANDISER', 'MANAGER', 'ADMIN', 'SUPERVISOR')),
  active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add manager_id if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'manager_id') THEN
    ALTER TABLE public.users ADD COLUMN manager_id TEXT REFERENCES public.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN
    ALTER TABLE public.users ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Stores table
CREATE TABLE IF NOT EXISTS public.stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
);

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'owner_id') THEN
    ALTER TABLE public.stores ADD COLUMN owner_id TEXT REFERENCES public.users(id);
  END IF;
END $$;

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  brand TEXT,
  sku TEXT,
  name TEXT,
  price NUMERIC,
  stock INTEGER,
  facing INTEGER
);

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'owner_id') THEN
    ALTER TABLE public.products ADD COLUMN owner_id TEXT REFERENCES public.users(id);
  END IF;
END $$;

-- Visits table
CREATE TABLE IF NOT EXISTS public.visits (
  id TEXT PRIMARY KEY,
  merchandiser_id TEXT REFERENCES public.users(id),
  store_id TEXT REFERENCES public.stores(id),
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  status TEXT CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED', 'LATE')),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  dlc TEXT,
  veille TEXT,
  rupture TEXT,
  photo_avant TEXT,
  photo_apres TEXT,
  rupture_items JSONB
);

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visits' AND column_name = 'owner_id') THEN
    ALTER TABLE public.visits ADD COLUMN owner_id TEXT REFERENCES public.users(id);
  END IF;
END $$;

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  visit_id TEXT REFERENCES public.visits(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('PHOTO', 'FORM', 'INVENTORY')),
  title TEXT,
  completed BOOLEAN DEFAULT false,
  required BOOLEAN DEFAULT false,
  data JSONB
);

-- Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. PERMISSIONS
-- ==========================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.users TO service_role;
GRANT SELECT ON public.users TO anon, authenticated;
GRANT INSERT, UPDATE ON public.users TO authenticated, service_role;

-- ==========================================
-- 5. RLS POLICIES
-- ==========================================

-- USERS POLICIES
DROP POLICY IF EXISTS "Users can view own profile and subordinates" ON public.users;
DROP POLICY IF EXISTS "Allow public read users" ON public.users;
CREATE POLICY "Users can view own profile and subordinates" ON public.users 
FOR SELECT USING ( 
  auth.uid()::text = id 
  OR manager_id = auth.uid()::text 
);

-- STORES POLICIES
DROP POLICY IF EXISTS "Manager can view own stores" ON public.stores;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.stores;
CREATE POLICY "Manager can view own stores" ON public.stores
FOR SELECT USING (
  owner_id = auth.uid()::text
  OR owner_id = (SELECT manager_id FROM public.users WHERE id = auth.uid()::text)
);

DROP POLICY IF EXISTS "Manager can insert own stores" ON public.stores;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.stores;
CREATE POLICY "Manager can insert own stores" ON public.stores
FOR INSERT WITH CHECK (auth.uid()::text = owner_id);

DROP POLICY IF EXISTS "Manager can update own stores" ON public.stores;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.stores;
CREATE POLICY "Manager can update own stores" ON public.stores
FOR UPDATE USING (owner_id = auth.uid()::text);

DROP POLICY IF EXISTS "Manager can delete own stores" ON public.stores;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.stores;
CREATE POLICY "Manager can delete own stores" ON public.stores
FOR DELETE USING (owner_id = auth.uid()::text);

-- PRODUCTS POLICIES
DROP POLICY IF EXISTS "Manager can view own products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
CREATE POLICY "Manager can view own products" ON public.products
FOR SELECT USING (
  owner_id = auth.uid()::text
  OR owner_id = (SELECT manager_id FROM public.users WHERE id = auth.uid()::text)
);

DROP POLICY IF EXISTS "Manager can insert own products" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
CREATE POLICY "Manager can insert own products" ON public.products
FOR INSERT WITH CHECK (auth.uid()::text = owner_id);

-- VISITS POLICIES
DROP POLICY IF EXISTS "Manager and Merch can view visits" ON public.visits;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.visits;
CREATE POLICY "Manager and Merch can view visits" ON public.visits
FOR SELECT USING (
  owner_id = auth.uid()::text
  OR merchandiser_id = auth.uid()::text
);

DROP POLICY IF EXISTS "Manager can insert visits" ON public.visits;
CREATE POLICY "Manager can insert visits" ON public.visits
FOR INSERT WITH CHECK (auth.uid()::text = owner_id);

DROP POLICY IF EXISTS "Merch can update assigned visits" ON public.visits;
CREATE POLICY "Merch can update assigned visits" ON public.visits
FOR UPDATE USING (
  owner_id = auth.uid()::text
  OR merchandiser_id = auth.uid()::text
);

-- TASKS POLICIES
DROP POLICY IF EXISTS "Access tasks via visit" ON public.tasks;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.tasks;
CREATE POLICY "Access tasks via visit" ON public.tasks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.visits v 
    WHERE v.id = tasks.visit_id 
    AND (v.owner_id = auth.uid()::text OR v.merchandiser_id = auth.uid()::text)
  )
);

-- LEADS POLICIES
DROP POLICY IF EXISTS "Allow public insert leads" ON public.leads;
CREATE POLICY "Allow public insert leads" ON public.leads 
FOR INSERT WITH CHECK (true);

-- ==========================================
-- 6. STORAGE
-- ==========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- ==========================================
-- 7. TRIGGERS (AUTH INTEGRATION)
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE NOTICE 'Creating user profile for: %', NEW.email;

  -- Delete any existing user profile with this email but different ID
  BEGIN
    DELETE FROM public.users WHERE email = NEW.email AND id <> NEW.id::text;
    RAISE NOTICE 'Cleaned up existing profiles for: %', NEW.email;
  EXCEPTION WHEN OTHERS THEN 
    RAISE NOTICE 'No existing profiles to clean up';
  END;

  -- Insert or update the user profile
  INSERT INTO public.users (id, email, name, role, active, zone, phone, created_at)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'SUPERVISOR'),
    true,
    COALESCE(NEW.raw_user_meta_data->>'zone', 'Global'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.created_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    zone = EXCLUDED.zone,
    created_at = EXCLUDED.created_at;
    
  RAISE NOTICE 'Successfully created user profile for: %', NEW.email;
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Trigger failed for user %: % (SQLSTATE: %)', NEW.email, SQLERRM, SQLSTATE;
  RAISE EXCEPTION 'Database error saving new user: %', SQLERRM;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 8. RPC FUNCTIONS
-- ==========================================

CREATE OR REPLACE FUNCTION public.create_demo_merchandiser(
  manager_email TEXT,
  merch_password TEXT,
  manager_name TEXT,
  manager_phone TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id TEXT;
  merch_email TEXT;
  mgr_id TEXT;
BEGIN
  -- Find the manager's ID
  SELECT id INTO mgr_id FROM public.users WHERE email = manager_email;
  
  IF mgr_id IS NULL THEN
    RAISE EXCEPTION 'Manager not found';
  END IF;

  -- Generate ID
  new_id := uuid_generate_v4()::text;
  
  -- Create merchandiser email
  merch_email := 'mobile.' || manager_email;

  INSERT INTO public.users (id, email, name, password, role, active, zone, phone, manager_id)
  VALUES (
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

  RETURN json_build_object(
    'id', new_id,
    'email', merch_email
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_demo_merchandiser TO anon, authenticated, service_role;

-- ==========================================
-- 9. DATA REPAIR (Fix missing profiles)
-- ==========================================

DO $$
DECLARE
  missing_user RECORD;
BEGIN
  FOR missing_user IN (
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id::text = pu.id
    WHERE pu.id IS NULL
  ) LOOP
    
    INSERT INTO public.users (id, email, name, role, active, zone, phone, created_at)
    VALUES (
      missing_user.id::text,
      missing_user.email,
      COALESCE(missing_user.raw_user_meta_data->>'name', 'Utilisateur'),
      COALESCE(missing_user.raw_user_meta_data->>'role', 'SUPERVISOR'),
      true,
      COALESCE(missing_user.raw_user_meta_data->>'zone', 'Global'),
      missing_user.raw_user_meta_data->>'phone',
      NOW()
    );
    
  END LOOP;
END $$;

-- ==========================================
-- 10. VERIFICATION
-- ==========================================

-- Verify table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

RAISE NOTICE '✅ Database setup complete!';
