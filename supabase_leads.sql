-- Create leads table
create table public.leads (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  phone text,
  company text,
  role text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.leads enable row level security;

-- Allow public insert (for landing page form)
create policy "Allow public insert"
  on public.leads
  for insert
  with check (true);

-- Allow admin select (optional, for viewing leads)
-- create policy "Allow admin select" on public.leads for select using (auth.role() = 'authenticated');
