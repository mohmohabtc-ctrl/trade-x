-- ==========================================
-- TradeX Security Fix: Password Hashing Migration
-- Implements bcrypt password hashing for secure storage
-- ==========================================

-- 1. Create trigger function to auto-hash passwords on insert/update
CREATE OR REPLACE FUNCTION public.hash_user_password()
RETURNS TRIGGER AS $$
BEGIN
  -- Only hash if password is provided and not already hashed
  IF NEW.password IS NOT NULL 
     AND NEW.password != '' 
     AND NOT (NEW.password LIKE '$2a$%' OR NEW.password LIKE '$2b$%') THEN
    NEW.password := crypt(NEW.password, gen_salt('bf', 10));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger to auto-hash passwords
DROP TRIGGER IF EXISTS hash_password_trigger ON public.users;
CREATE TRIGGER hash_password_trigger
  BEFORE INSERT OR UPDATE OF password ON public.users
  FOR EACH ROW
  WHEN (NEW.password IS NOT NULL)
  EXECUTE FUNCTION public.hash_user_password();

-- 3. Update login_demo_user function to use bcrypt verification
CREATE OR REPLACE FUNCTION public.login_demo_user(
  email_input TEXT,
  password_input TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_user RECORD;
BEGIN
  -- Find user by email and verify password with bcrypt
  SELECT * INTO found_user 
  FROM public.users 
  WHERE lower(trim(email)) = lower(trim(email_input))
  AND password = crypt(password_input, password) -- bcrypt verification
  LIMIT 1;

  IF found_user.id IS NOT NULL THEN
    RETURN json_build_object(
      'id', found_user.id,
      'email', found_user.email,
      'role', found_user.role,
      'name', found_user.name,
      'zone', found_user.zone
    );
  ELSE
    RETURN NULL;
  END IF;
END;
$$;

-- 4. Update create_demo_merchandiser to use auto-hashing
-- (Password will be auto-hashed by trigger, no changes needed to function body)
-- Just ensure the function is using the latest version
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
  -- Normalize email for lookup
  SELECT id INTO mgr_id FROM public.users WHERE lower(trim(email)) = lower(trim(manager_email));
  
  IF mgr_id IS NULL THEN
    RAISE EXCEPTION 'Manager not found for email: %', manager_email;
  END IF;

  new_id := gen_random_uuid()::text;
  merch_email := 'mobile.' || manager_email;

  -- Password will be auto-hashed by trigger
  INSERT INTO public.users (id, email, name, password, role, active, zone, phone, manager_id)
  VALUES (
    new_id,
    merch_email,
    'Merch ' || manager_name,
    merch_password, -- Will be auto-hashed by trigger
    'MERCHANDISER',
    TRUE,
    'Terrain',
    manager_phone,
    mgr_id
  )
  ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password, -- Will be auto-hashed by trigger
    name = EXCLUDED.name,
    manager_id = EXCLUDED.manager_id;

  -- Return the ID of the user (either new or existing)
  SELECT id INTO new_id FROM public.users WHERE email = merch_email;
  RETURN json_build_object('id', new_id, 'email', merch_email);
END;
$$;

-- 5. Update handle_new_user trigger function to use auto-hashing
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Aggressively delete any existing user profile with this email but different ID
  BEGIN
    DELETE FROM public.users WHERE email = NEW.email AND id <> NEW.id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Password will be auto-hashed by hash_password_trigger
  INSERT INTO public.users (id, email, name, role, active, zone, phone, password, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'SUPERVISOR'),
    TRUE,
    COALESCE(NEW.raw_user_meta_data->>'zone', 'Global'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'password', -- Will be auto-hashed by trigger
    COALESCE(NEW.created_at, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    password = EXCLUDED.password, -- Will be auto-hashed by trigger
    created_at = EXCLUDED.created_at;
    
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Trigger Failed: %', SQLERRM;
END;
$$;

-- 6. Migrate existing plaintext passwords to bcrypt hashes
-- This will hash all passwords that are not already hashed
DO $$
DECLARE
  user_record RECORD;
  hashed_count INTEGER := 0;
BEGIN
  FOR user_record IN 
    SELECT id, password 
    FROM public.users 
    WHERE password IS NOT NULL 
    AND password != ''
    AND NOT (password LIKE '$2a$%' OR password LIKE '$2b$%') -- Exclude already hashed
  LOOP
    UPDATE public.users 
    SET password = crypt(user_record.password, gen_salt('bf', 10))
    WHERE id = user_record.id;
    
    hashed_count := hashed_count + 1;
    RAISE NOTICE 'Hashed password for user ID: %', user_record.id;
  END LOOP;
  
  RAISE NOTICE 'Migration complete. Hashed % passwords.', hashed_count;
END $$;

-- 7. Verify migration
-- This query should return 0 if all passwords are properly hashed
SELECT COUNT(*) as plaintext_passwords_remaining
FROM public.users 
WHERE password IS NOT NULL 
AND password != ''
AND NOT (password LIKE '$2a$%' OR password LIKE '$2b$%');

-- Expected output: plaintext_passwords_remaining = 0
