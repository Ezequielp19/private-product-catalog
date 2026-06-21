-- =====================================================================
-- LMProductos - Tablas
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase.
-- =====================================================================

create extension if not exists pgcrypto;

-- Perfiles de usuario (1 a 1 con auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  email text not null default '',
  approved boolean not null default false,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

-- Productos del catálogo
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null default '',
  categoria text,
  precio numeric(12, 2) not null default 0,
  imagen text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table if exists public.products
  add column if not exists categoria text;

create index if not exists products_activo_idx on public.products (activo);
create index if not exists profiles_approved_idx on public.profiles (approved);
