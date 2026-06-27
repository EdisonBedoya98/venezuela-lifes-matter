-- Safe admin setup.
--
-- 1. In the project dashboard, go to Authentication > Users > Add user.
-- 2. Create the user with email and password.
-- 3. Change the values below and run this SQL in the project SQL editor.
--
-- The app checks app_metadata.role / app_metadata.roles against ADMIN_ROLE.

do $$
declare
  admin_email text := 'admin@venezuela-lives-matter.org';
  admin_full_name text := 'Venezuela Lives Matter Admin';
  target_user_id uuid;
begin
  select id
  into target_user_id
  from auth.users
  where lower(email) = lower(admin_email)
  limit 1;

  if target_user_id is null then
    raise exception
      'No existe un usuario Auth con email %. Crealo primero en Authentication > Users y vuelve a correr este SQL.',
      admin_email;
  end if;

  update auth.users
  set raw_app_meta_data =
        coalesce(raw_app_meta_data, '{}'::jsonb)
        || jsonb_build_object(
          'role', 'admin',
          'user_role', 'admin',
          'roles', jsonb_build_array('admin'),
          'user_roles', jsonb_build_array('admin')
        ),
      raw_user_meta_data =
        coalesce(raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object('full_name', admin_full_name),
      updated_at = now()
  where id = target_user_id;

  insert into public.profiles (id, email, full_name, role)
  values (target_user_id, admin_email, admin_full_name, 'admin')
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        role = 'admin',
        updated_at = now();
end $$;
