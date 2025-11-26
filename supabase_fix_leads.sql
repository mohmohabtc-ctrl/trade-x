-- Enable RLS on leads table
alter table public.leads enable row level security;

-- Drop existing policy if any
drop policy if exists "Allow public insert leads" on public.leads;
drop policy if exists "Allow public insert" on public.leads;

-- Create policy to allow public insert
create policy "Allow public insert leads"
  on public.leads
  for insert
  with check (true);

-- Verify: Allow reading leads (optional, for admin)
-- create policy "Allow authenticated read leads" on public.leads for select using (auth.role() = 'authenticated');
