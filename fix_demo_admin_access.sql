-- ==========================================
-- FIX: Enable Admin Demo Login (and fix mohmohabtc@gmail.com)
-- ==========================================

-- 1. Update handle_new_user trigger to save password in public.users
-- This allows the "login_demo_user" RPC to work for Admins too (bypassing email confirmation)

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
    new.raw_user_meta_data->>'password', -- EXTRACT PASSWORD FROM METADATA
    coalesce(new.created_at, now())
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    role = excluded.role,
    phone = excluded.phone,
    password = excluded.password, -- UPDATE PASSWORD IF CHANGED
    created_at = excluded.created_at;
    
  return new;
exception when others then
  raise exception 'Trigger Failed: %', SQLERRM;
end;
$$;

-- 2. Manually fix the specific user 'mohmohabtc@gmail.com'
-- We set a password for them so they can log in via RPC immediately

update public.users
set password = 'password123' -- Default demo password if unknown, or set temporary
where email = 'mohmohabtc@gmail.com';

-- IMPORTANT: You might need to change 'password123' to the actual password they used
-- if you know it, or just use this one and tell them.
