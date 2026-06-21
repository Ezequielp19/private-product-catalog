-- =====================================================================
-- LMProductos - Creación automática de perfil al registrarse
-- =====================================================================

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
    -- El administrador queda aprobado automáticamente
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
