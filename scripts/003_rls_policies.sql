-- =====================================================================
-- LMProductos - Row Level Security (RLS)
-- El administrador se identifica por email: lmproductos@gmail.com
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;

-- ---------- PROFILES ----------
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

-- ---------- PRODUCTS ----------
-- Lectura: el admin ve todo; el publico y los aprobados ven solo activos.
drop policy if exists "products_select" on public.products;
create policy "products_select" on public.products
  for select
  using (
    (auth.jwt() ->> 'email') = 'lmproductos@gmail.com'
    or activo = true
    or (
      auth.uid() is not null
      and exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.approved = true
      )
    )
  );

-- Escritura: solo el administrador.
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
