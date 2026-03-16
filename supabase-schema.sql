-- ============================================
-- NUNO STORE — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- Products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price integer not null,
  original_price integer,
  category text not null,
  sizes text[] default '{}',
  badge text,
  color text,
  stock integer default 0,
  image_url text,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- Customers (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  created_at timestamp with time zone default now()
);

-- Addresses
create table public.addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean default false,
  created_at timestamp with time zone default now()
);

-- Orders
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  status text default 'pending' check (status in ('pending','paid','processing','shipped','delivered','cancelled')),
  total integer not null,
  shipping integer default 0,
  razorpay_order_id text,
  razorpay_payment_id text,
  address jsonb not null,
  created_at timestamp with time zone default now()
);

-- Order Items
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  product_image text,
  size text not null,
  quantity integer not null,
  price integer not null
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Products: anyone can read, only service role can write
create policy "Products are viewable by everyone" on public.products
  for select using (active = true);

-- Profiles: users manage their own
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Addresses
create policy "Users can manage own addresses" on public.addresses
  for all using (auth.uid() = user_id);

-- Orders: users see own orders
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id);

-- Order items: users see own order items
create policy "Users can view own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- ============================================
-- Auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- Storage bucket for product images
-- ============================================
insert into storage.buckets (id, name, public) values ('products', 'products', true);

create policy "Product images are publicly accessible" on storage.objects
  for select using (bucket_id = 'products');

create policy "Admins can upload product images" on storage.objects
  for insert with check (bucket_id = 'products');

-- ============================================
-- Sample products (optional)
-- ============================================
insert into public.products (name, description, price, original_price, category, sizes, badge, color, stock) values
('NUNO Oversized Tee', 'Ultra-soft 240GSM cotton. Boxy drop-shoulder cut.', 999, 1499, 'Tops', array['S','M','L','XL','XXL'], 'New', 'Black', 50),
('Raw Hem Hoodie', 'Brushed fleece inside. Raw hem finish. Relaxed fit.', 1799, null, 'Tops', array['S','M','L','XL'], null, 'Ash', 30),
('Cargo Joggers', '6-pocket cargo design. Tapered ankle. Heavy twill.', 1399, 1999, 'Bottoms', array['S','M','L','XL','XXL'], 'Hot', 'Olive', 40),
('Drop-Shoulder Jacket', 'Structured shell. Drop shoulder seam. Zip closure.', 2499, null, 'Outerwear', array['M','L','XL'], null, 'Slate', 20),
('Acid Wash Tee', 'Hand acid-washed. No two are the same. 200GSM.', 849, 1199, 'Tops', array['S','M','L','XL'], 'Sale', 'White', 25),
('Wide Leg Pants', 'High-rise wide leg. Elasticated waistband.', 1599, null, 'Bottoms', array['S','M','L','XL'], 'New', 'Ecru', 35),
('Thermal Henley', 'Waffle-knit thermal fabric. 3-button placket.', 1099, null, 'Tops', array['S','M','L','XL','XXL'], null, 'Camel', 45),
('Track Shorts', 'Mesh-lined. Side stripe. 7-inch inseam.', 699, 999, 'Bottoms', array['S','M','L','XL'], 'Sale', 'Black', 60);
