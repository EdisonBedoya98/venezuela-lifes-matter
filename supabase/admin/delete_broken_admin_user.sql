-- Cleanup for admin users created directly in auth.users.
--
-- Use this in Supabase SQL Editor if Auth login returns:
-- "Database error querying schema" or "Database error finding users".
--
-- 1. Set admin_email to the broken admin email.
-- 2. Run this SQL.
-- 3. Recreate the admin with scripts/create-supabase-admin.mjs.

do $$
declare
  admin_email text := 'admin123@gmail.com';
  target_user_id uuid;
begin
  select id
  into target_user_id
  from auth.users
  where lower(email) = lower(admin_email)
  limit 1;

  if target_user_id is null then
    raise notice 'No existe un usuario Auth con email %', admin_email;
    return;
  end if;

  delete from auth.identities where user_id = target_user_id;
  delete from public.profiles where id = target_user_id;
  delete from auth.users where id = target_user_id;

  raise notice 'Usuario admin dañado eliminado: % (%)', admin_email, target_user_id;
end $$;
