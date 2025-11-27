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
