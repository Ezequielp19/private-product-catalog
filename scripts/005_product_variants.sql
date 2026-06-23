-- =====================================================================
-- LMProductos - Soporte de variantes de precio
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase.
-- =====================================================================

alter table if exists public.products
  add column if not exists modo_precio text not null default 'single';

alter table if exists public.products
  add column if not exists variantes jsonb not null default '[]'::jsonb;

update public.products
set
  modo_precio = coalesce(modo_precio, 'single'),
  variantes = coalesce(variantes, '[]'::jsonb)
where modo_precio is null or variantes is null;
