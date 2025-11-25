-- Enable RLS on users table
alter table public.users enable row level security;

-- Allow public insert (for demo account creation)
drop policy if exists "Allow public insert users" on public.users;
create policy "Allow public insert users"
  on public.users
  for insert
  with check (true);

-- Allow public read (so App.tsx can fetch users)
drop policy if exists "Allow public read users" on public.users;
create policy "Allow public read users"
  on public.users
  for select
  using (true);
