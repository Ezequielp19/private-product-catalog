-- =====================================================================
-- LMProductos - Tipos de variante + configuración de inicio
-- =====================================================================

alter table public.products
  add column if not exists tipo_variante text,
  add column if not exists destacado_inicio boolean not null default false,
  add column if not exists orden_inicio integer;

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select" on public.site_settings;
create policy "site_settings_select" on public.site_settings
  for select using (true);

drop policy if exists "site_settings_write" on public.site_settings;
create policy "site_settings_write" on public.site_settings
  for all
  using ((auth.jwt() ->> 'email') = 'lmproductos@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'lmproductos@gmail.com');

create index if not exists products_destacado_inicio_idx
  on public.products (destacado_inicio, orden_inicio)
  where destacado_inicio = true;
