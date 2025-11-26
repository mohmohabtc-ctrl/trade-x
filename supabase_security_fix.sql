-- Enable RLS on tables
alter table public.products enable row level security;
alter table public.visits enable row level security;
alter table public.stores enable row level security;
alter table public.tasks enable row level security;

-- PRODUCTS: Allow read for everyone, write for authenticated
create policy "Enable read access for all users" on public.products for select using (true);
create policy "Enable insert for authenticated users only" on public.products for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on public.products for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on public.products for delete using (auth.role() = 'authenticated');

-- STORES: Allow read for everyone, write for authenticated
create policy "Enable read access for all users" on public.stores for select using (true);
create policy "Enable insert for authenticated users only" on public.stores for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on public.stores for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on public.stores for delete using (auth.role() = 'authenticated');

-- VISITS: Allow all access for authenticated users (Merchandisers need to read/write)
create policy "Enable all access for authenticated users" on public.visits for all using (auth.role() = 'authenticated');

-- TASKS: Allow all access for authenticated users
create policy "Enable all access for authenticated users" on public.tasks for all using (auth.role() = 'authenticated');
