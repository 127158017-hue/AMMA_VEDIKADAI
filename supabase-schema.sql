create table if not exists public.products (
  id text primary key,
  title text not null,
  category text not null,
  mrp numeric not null default 0,
  price numeric not null default 0,
  image_url text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  customer jsonb not null,
  items jsonb not null,
  total numeric not null default 0,
  savings numeric not null default 0,
  status text not null default 'Order Pending'
);

create table if not exists public.store_contact (
  id int primary key default 1,
  phone text not null default '',
  email text not null default '',
  constraint store_contact_single_row check (id = 1)
);

insert into public.products (id, title, category, mrp, price, image_url)
values
  ('gm-001', 'Classic Red Bijili', 'Ground-made', 240, 180, ''),
  ('gm-002', 'Flower Pot Gold', 'Ground-made', 420, 320, ''),
  ('gm-003', 'Ground Chakkar Deluxe', 'Ground-made', 300, 240, ''),
  ('sf-001', 'Sivakasi Sky Shot', 'Sivakasi Fancy', 950, 780, ''),
  ('sf-002', 'Fancy Sparkle Fountain', 'Sivakasi Fancy', 700, 540, '')
on conflict (id) do nothing;

insert into public.store_contact (id, phone, email)
values (1, '+91 98765 43210', 'orders@vedikadai.local')
on conflict (id) do nothing;

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.store_contact enable row level security;

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
on public.products for select
to anon
using (true);

drop policy if exists "Public can manage products" on public.products;
create policy "Public can manage products"
on public.products for all
to anon
using (true)
with check (true);

drop policy if exists "Public can read orders" on public.orders;
create policy "Public can read orders"
on public.orders for select
to anon
using (true);

drop policy if exists "Public can create orders" on public.orders;
create policy "Public can create orders"
on public.orders for insert
to anon
with check (true);

drop policy if exists "Public can update orders" on public.orders;
create policy "Public can update orders"
on public.orders for update
to anon
using (true)
with check (true);

drop policy if exists "Public can read contact" on public.store_contact;
create policy "Public can read contact"
on public.store_contact for select
to anon
using (true);

drop policy if exists "Public can update contact" on public.store_contact;
create policy "Public can update contact"
on public.store_contact for update
to anon
using (true)
with check (true);
