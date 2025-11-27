-- 1. Create a function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role, active, zone, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    coalesce(new.raw_user_meta_data->>'role', 'SUPERVISOR'), -- Default to SUPERVISOR if not specified
    true,
    coalesce(new.raw_user_meta_data->>'zone', 'Global'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Update RLS on users table to allow users to read their own data
alter table public.users enable row level security;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
  on public.users
  for select
  using ( auth.uid()::text = id );

-- Allow public read is still needed for the app to load all users (e.g. for admin view), 
-- but strictly speaking, we might want to restrict this. 
-- For now, we keep the "Allow public read users" policy created earlier or ensure it exists.
-- If we want to be stricter:
-- drop policy if exists "Allow public read users" on public.users;
-- create policy "Allow authenticated read all users" on public.users for select using (auth.role() = 'authenticated');
