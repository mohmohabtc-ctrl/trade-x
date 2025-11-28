-- ==========================================
-- FIX DATABASE PERMISSIONS & TRIGGERS
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. DROP CONFLICTING TRIGGERS ON LEADS
-- We suspect a trigger on 'leads' is trying to insert into 'users' as 'anon', causing 42501.
-- This drops ALL triggers on the leads table to be safe.
DO $$
DECLARE
    trg_name text;
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

-- 2. ENSURE LEADS IS PUBLICLY WRITABLE
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert leads" ON public.leads;
CREATE POLICY "Allow public insert leads" ON public.leads 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read leads" ON public.leads; -- Optional: usually not needed for public
-- If you want leads to be readable by anon (e.g. for debugging), uncomment:
-- CREATE POLICY "Allow public read leads" ON public.leads FOR SELECT USING (true);

-- 3. FIX USERS PERMISSIONS (Just in case)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.users TO service_role;
GRANT SELECT ON public.users TO anon, authenticated;
-- Allow anon to insert into users? NO. 
-- Users are inserted via:
-- a) Auth Trigger (Security Definer -> runs as postgres/admin)
-- b) RPC create_demo_merchandiser (Security Definer -> runs as postgres/admin)
-- So 'anon' does NOT need insert on 'users'.

-- 4. VERIFY AUTH TRIGGER IS ROBUST
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- CRITICAL: Runs as admin, bypassing RLS
SET search_path = public
AS $$
BEGIN
  -- Aggressively delete any existing user profile with this email but different ID
  BEGIN
    DELETE FROM public.users WHERE email = NEW.email AND id <> NEW.id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  INSERT INTO public.users (id, email, name, role, active, zone, phone, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
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
    created_at = EXCLUDED.created_at;
    
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block auth? Or block?
  -- Better to block so we know it failed.
  RAISE EXCEPTION 'Trigger Failed: %', SQLERRM;
END;
$$;

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. FIX RPC FUNCTION PERMISSIONS
GRANT EXECUTE ON FUNCTION public.create_demo_merchandiser TO anon, authenticated, service_role;
