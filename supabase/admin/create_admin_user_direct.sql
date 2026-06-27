-- Direct Auth admin creation for command-line use with psql.
--
-- IMPORTANT:
-- This touches Supabase Auth internal tables. Use it for initial bootstrap only.
-- For normal production flows, prefer the Supabase Auth Admin API.
--
-- Usage:
-- psql "$SUPABASE_DB_URL" \
--   -v admin_email='admin@venezuela-lives-matter.org' \
--   -v admin_password='ChangeThisPassword123!' \
--   -v admin_full_name='Venezuela Lives Matter Admin' \
--   -f supabase/admin/create_admin_user_direct.sql

\if :{?admin_email}
\else
\set admin_email 'admin@venezuela-lives-matter.org'
\endif

\if :{?admin_password}
\else
\set admin_password 'ChangeThisPassword123!'
\endif

\if :{?admin_full_name}
\else
\set admin_full_name 'Venezuela Lives Matter Admin'
\endif

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

select set_config('vlm.admin_email', :'admin_email', false);
select set_config('vlm.admin_password', :'admin_password', false);
select set_config('vlm.admin_full_name', :'admin_full_name', false);

do $$
declare
  admin_email text := current_setting('vlm.admin_email');
  admin_password text := current_setting('vlm.admin_password');
  admin_full_name text := current_setting('vlm.admin_full_name');
  target_user_id uuid;
begin
  if admin_email is null or length(trim(admin_email)) = 0 then
    raise exception 'admin_email es requerido';
  end if;

  if admin_password is null or length(admin_password) < 8 then
    raise exception 'admin_password debe tener al menos 8 caracteres';
  end if;

  select id
  into target_user_id
  from auth.users
  where lower(email) = lower(admin_email)
  limit 1;

  if target_user_id is null then
    target_user_id := extensions.gen_random_uuid();

    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      is_sso_user,
      created_at,
      updated_at
    )
    values (
      target_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      lower(admin_email),
      extensions.crypt(admin_password, extensions.gen_salt('bf')),
      now(),
      jsonb_build_object(
        'provider', 'email',
        'providers', jsonb_build_array('email'),
        'role', 'admin',
        'user_role', 'admin',
        'roles', jsonb_build_array('admin'),
        'user_roles', jsonb_build_array('admin')
      ),
      jsonb_build_object('full_name', admin_full_name),
      false,
      false,
      now(),
      now()
    );
  else
    update auth.users
    set encrypted_password = extensions.crypt(admin_password, extensions.gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_app_meta_data =
          coalesce(raw_app_meta_data, '{}'::jsonb)
          || jsonb_build_object(
            'provider', 'email',
            'providers', jsonb_build_array('email'),
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
  end if;

  if not exists (
    select 1
    from auth.identities
    where provider = 'email'
      and provider_id = target_user_id::text
  ) then
    insert into auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      target_user_id::text,
      target_user_id,
      jsonb_build_object(
        'sub', target_user_id::text,
        'email', lower(admin_email),
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      now(),
      now(),
      now()
    );
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (target_user_id, lower(admin_email), admin_full_name, 'admin')
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        role = 'admin',
        updated_at = now();

  raise notice 'Admin listo: % (%)', admin_email, target_user_id;
end $$;
