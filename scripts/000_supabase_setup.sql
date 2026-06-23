-- =====================================================================
-- LMProductos - Setup completo para Supabase
-- Ejecuta este archivo completo en el SQL Editor de Supabase.
-- Orden recomendado:
--   1) tablas
--   2) trigger de perfil
--   3) policies RLS
--   4) storage
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1) Tablas
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  email text not null default '',
  approved boolean not null default false,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null default '',
  categoria text,
  precio numeric(12, 2) not null default 0,
  modo_precio text not null default 'single',
  variantes jsonb not null default '[]'::jsonb,
  imagen text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table if exists public.products
  add column if not exists categoria text;
alter table if exists public.products
  add column if not exists modo_precio text not null default 'single';
alter table if exists public.products
  add column if not exists variantes jsonb not null default '[]'::jsonb;

create index if not exists products_activo_idx on public.products (activo);
create index if not exists profiles_approved_idx on public.profiles (approved);

-- ---------------------------------------------------------------------
-- 2) Trigger de perfil automático
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, email, approved, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    new.email,
    case when new.email = 'lmproductos@gmail.com' then true else false end,
    case when new.email = 'lmproductos@gmail.com' then 'admin' else 'user' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 3) RLS
-- ---------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.products enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select
  using (
    auth.uid() = id
    or (auth.jwt() ->> 'email') = 'lmproductos@gmail.com'
  );

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles
  for insert
  with check ( auth.uid() = id );

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update
  using (
    auth.uid() = id
    or (auth.jwt() ->> 'email') = 'lmproductos@gmail.com'
  );

drop policy if exists "profiles_delete" on public.profiles;
create policy "profiles_delete" on public.profiles
  for delete
  using ( (auth.jwt() ->> 'email') = 'lmproductos@gmail.com' );

drop policy if exists "products_select" on public.products;
create policy "products_select" on public.products
  for select
  using (
    (auth.jwt() ->> 'email') = 'lmproductos@gmail.com'
    or activo = true
    or (
      auth.uid() is not null
      and exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.approved = true
      )
    )
  );

drop policy if exists "products_insert" on public.products;
create policy "products_insert" on public.products
  for insert
  with check ( (auth.jwt() ->> 'email') = 'lmproductos@gmail.com' );

drop policy if exists "products_update" on public.products;
create policy "products_update" on public.products
  for update
  using ( (auth.jwt() ->> 'email') = 'lmproductos@gmail.com' );

drop policy if exists "products_delete" on public.products;
create policy "products_delete" on public.products
  for delete
  using ( (auth.jwt() ->> 'email') = 'lmproductos@gmail.com' );

-- ---------------------------------------------------------------------
-- 4) Storage
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

drop policy if exists "products_storage_select" on storage.objects;
create policy "products_storage_select" on storage.objects
  for select
  using ( bucket_id = 'products' );

drop policy if exists "products_storage_insert" on storage.objects;
create policy "products_storage_insert" on storage.objects
  for insert
  with check (
    bucket_id = 'products'
    and (auth.jwt() ->> 'email') = 'lmproductos@gmail.com'
  );

drop policy if exists "products_storage_update" on storage.objects;
create policy "products_storage_update" on storage.objects
  for update
  using (
    bucket_id = 'products'
    and (auth.jwt() ->> 'email') = 'lmproductos@gmail.com'
  );

drop policy if exists "products_storage_delete" on storage.objects;
create policy "products_storage_delete" on storage.objects
  for delete
  using (
    bucket_id = 'products'
    and (auth.jwt() ->> 'email') = 'lmproductos@gmail.com'
  );
