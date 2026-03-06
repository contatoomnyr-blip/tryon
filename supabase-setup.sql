-- ============================================================
-- Try It On — Setup do Banco de Dados Supabase
-- Execute este SQL no SQL Editor do seu projeto Supabase
-- ============================================================

-- Perfil do usuário (complementa auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Catálogo de roupas
create table if not exists garments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  price decimal(10,2),
  category text check (category in ('upper', 'lower', 'dress', 'overall')),
  image_url text not null,
  product_url text,
  created_at timestamp with time zone default now()
);

-- Resultados de try-on
create table if not exists tryon_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  person_image_url text not null,
  garment_id uuid references garments on delete set null,
  garment_image_url text,
  result_image_url text not null,
  is_favorite boolean default false,
  in_cart boolean default false,
  created_at timestamp with time zone default now()
);

-- Itens do carrinho
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  garment_id uuid references garments on delete cascade not null,
  tryon_result_id uuid references tryon_results on delete set null,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table profiles enable row level security;
alter table garments enable row level security;
alter table tryon_results enable row level security;
alter table cart_items enable row level security;

-- Profiles: usuário vê/edita apenas o próprio perfil
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Garments: todos podem ver (catálogo público)
create policy "Anyone can view garments" on garments
  for select using (true);

-- TryOn Results: usuário vê/modifica apenas os próprios
create policy "Users can view own results" on tryon_results
  for select using (auth.uid() = user_id);

create policy "Users can insert own results" on tryon_results
  for insert with check (auth.uid() = user_id);

create policy "Users can update own results" on tryon_results
  for update using (auth.uid() = user_id);

-- Service role pode inserir (para a API route)
create policy "Service role can insert results" on tryon_results
  for insert with check (true);

-- Cart Items: usuário vê/modifica apenas o próprio carrinho
create policy "Users can view own cart" on cart_items
  for select using (auth.uid() = user_id);

create policy "Users can insert own cart" on cart_items
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own cart" on cart_items
  for delete using (auth.uid() = user_id);

-- ============================================================
-- Trigger: criar perfil automaticamente ao registrar
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Storage: bucket para imagens
-- ============================================================
-- Execute no Dashboard > Storage:
-- 1. Criar bucket: "try-on-images" (public)
-- 2. Ou via SQL:

insert into storage.buckets (id, name, public)
values ('try-on-images', 'try-on-images', true)
on conflict (id) do nothing;

create policy "Anyone can view try-on images" on storage.objects
  for select using (bucket_id = 'try-on-images');

create policy "Authenticated users can upload" on storage.objects
  for insert with check (
    bucket_id = 'try-on-images' and
    auth.role() = 'authenticated'
  );

-- ============================================================
-- Dados Mock do Catálogo (12 peças)
-- Use URLs de imagens reais com fundo branco para melhor resultado
-- ============================================================

insert into garments (name, brand, price, category, image_url) values
  -- Camisetas/Blusas (upper)
  ('Camiseta Básica Branca', 'TryOn Brand', 59.90, 'upper',
   'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&bg=white'),
  ('Camiseta Listrada Azul', 'TryOn Brand', 79.90, 'upper',
   'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400'),
  ('Blusa Feminina Floral', 'TryOn Brand', 99.90, 'upper',
   'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400'),
  ('Camiseta Oversized Preta', 'TryOn Brand', 89.90, 'upper',
   'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400'),

  -- Calças/Saias (lower)
  ('Calça Jeans Skinny', 'TryOn Brand', 159.90, 'lower',
   'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400'),
  ('Calça Social Bege', 'TryOn Brand', 189.90, 'lower',
   'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400'),
  ('Saia Midi Preta', 'TryOn Brand', 129.90, 'lower',
   'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400'),
  ('Bermuda Jeans Destroyed', 'TryOn Brand', 119.90, 'lower',
   'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400'),

  -- Vestidos/Macacões (overall/dress)
  ('Vestido Floral Longo', 'TryOn Brand', 219.90, 'dress',
   'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400'),
  ('Vestido Preto Elegante', 'TryOn Brand', 249.90, 'dress',
   'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400'),
  ('Macacão Jeans', 'TryOn Brand', 279.90, 'overall',
   'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=400'),
  ('Macacão Casual Branco', 'TryOn Brand', 199.90, 'overall',
   'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=400');
