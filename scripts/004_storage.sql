-- =====================================================================
-- LMProductos - Storage (bucket de imágenes de productos)
-- =====================================================================

-- Crear bucket público "products"
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

-- Lectura pública de las imágenes
drop policy if exists "products_storage_select" on storage.objects;
create policy "products_storage_select" on storage.objects
  for select
  using ( bucket_id = 'products' );

-- Subir imágenes: solo el administrador
drop policy if exists "products_storage_insert" on storage.objects;
create policy "products_storage_insert" on storage.objects
  for insert
  with check (
    bucket_id = 'products'
    and (auth.jwt() ->> 'email') = 'lmproductos@gmail.com'
  );

-- Actualizar imágenes: solo el administrador
drop policy if exists "products_storage_update" on storage.objects;
create policy "products_storage_update" on storage.objects
  for update
  using (
    bucket_id = 'products'
    and (auth.jwt() ->> 'email') = 'lmproductos@gmail.com'
  );

-- Eliminar imágenes: solo el administrador
drop policy if exists "products_storage_delete" on storage.objects;
create policy "products_storage_delete" on storage.objects
  for delete
  using (
    bucket_id = 'products'
    and (auth.jwt() ->> 'email') = 'lmproductos@gmail.com'
  );
