-- ==========================================
-- FIX: Database error saving new user
-- This script fixes the handle_new_user trigger
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Drop and recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- CRITICAL: Runs as admin, bypassing RLS
SET search_path = public
AS $$
BEGIN
  -- Log the attempt
  RAISE NOTICE 'Attempting to create user profile for: %', NEW.email;

  -- Aggressively delete any existing user profile with this email but different ID
  BEGIN
    DELETE FROM public.users WHERE email = NEW.email AND id <> NEW.id::text;
    RAISE NOTICE 'Cleaned up existing profiles for email: %', NEW.email;
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
    
  RAISE NOTICE 'Successfully created/updated user profile for: %', NEW.email;
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log the full error details
  RAISE WARNING 'Trigger failed for user %: % (SQLSTATE: %)', NEW.email, SQLERRM, SQLSTATE;
  -- Re-raise to block the signup if profile creation fails
  RAISE EXCEPTION 'Database error saving new user: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;

-- 2. Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Grant necessary permissions
GRANT ALL ON public.users TO service_role;
GRANT SELECT ON public.users TO anon, authenticated;
GRANT INSERT, UPDATE ON public.users TO authenticated;

-- 4. Verify the users table structure
DO $$
BEGIN
  -- Ensure all required columns exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') THEN
    RAISE EXCEPTION 'users table missing id column';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
    ALTER TABLE public.users ADD COLUMN email text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
    ALTER TABLE public.users ADD COLUMN name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE public.users ADD COLUMN role text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'active') THEN
    ALTER TABLE public.users ADD COLUMN active boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'zone') THEN
    ALTER TABLE public.users ADD COLUMN zone text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
    ALTER TABLE public.users ADD COLUMN phone text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN
    ALTER TABLE public.users ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
  
  RAISE NOTICE 'All required columns verified';
END $$;

-- 5. Check for any constraints that might be blocking inserts
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
ORDER BY contype, conname;
