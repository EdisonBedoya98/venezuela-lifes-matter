-- Core schema for Venezuela Lives Matter.
-- Run this migration before seeding catalog data or connecting the app.

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  create type public.app_role as enum ('admin', 'center_owner');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.center_status as enum ('pending', 'approved', 'rejected', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.review_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.center_event_type as enum ('whatsapp_click', 'route_click', 'share_click');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role public.app_role not null default 'center_owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email))
  where email is not null;

create table if not exists public.aid_categories (
  id text primary key,
  label text not null,
  short_label text not null,
  accent text not null,
  surface text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aid_cities (
  id text primary key,
  name text not null,
  department text not null,
  map_center_lat numeric(10, 7) not null,
  map_center_lng numeric(10, 7) not null,
  map_zoom integer not null default 12,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aid_cities_lat_check check (map_center_lat between -4.5 and 13.8),
  constraint aid_cities_lng_check check (map_center_lng between -82.2 and -66.8)
);

create table if not exists public.aid_centers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status public.center_status not null default 'pending',
  owner_user_id uuid references auth.users (id) on delete set null,
  name text not null,
  department text not null,
  city text not null,
  city_id text references public.aid_cities (id) on update cascade on delete set null,
  neighborhood text,
  commune text,
  address text not null,
  location_details text,
  formatted_address text,
  google_place_id text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  geocode_confidence text,
  geocode_location_type text,
  geocode_partial_match boolean not null default false,
  geocode_needs_review boolean not null default true,
  geocode_query text,
  primary_category text references public.aid_categories (id) on update cascade on delete set null,
  categories text[] not null default '{}',
  description text not null,
  requirements text,
  attention_days text[] not null default '{}',
  opening_time time,
  closing_time time,
  hours_label text,
  public_contact text,
  impact_visits integer not null default 0,
  impact_supplies_kg integer not null default 0,
  impact_families integer not null default 0,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aid_centers_lat_check check (latitude is null or latitude between -4.5 and 13.8),
  constraint aid_centers_lng_check check (longitude is null or longitude between -82.2 and -66.8),
  constraint aid_centers_approved_location_check check (
    status <> 'approved'
    or (
      latitude is not null
      and longitude is not null
      and google_place_id is not null
    )
  ),
  constraint aid_centers_impact_check check (
    impact_visits >= 0
    and impact_supplies_kg >= 0
    and impact_families >= 0
  )
);

create index if not exists aid_centers_status_idx on public.aid_centers (status);
create index if not exists aid_centers_city_id_idx on public.aid_centers (city_id);
create index if not exists aid_centers_owner_user_id_idx on public.aid_centers (owner_user_id);
create index if not exists aid_centers_google_place_id_idx on public.aid_centers (google_place_id);

create table if not exists public.center_verification_details (
  center_id uuid primary key references public.aid_centers (id) on delete cascade,
  reporter_name text not null,
  reporter_email text not null,
  reporter_phone text not null,
  reporter_organization text,
  data_consent boolean not null default false,
  email_consent boolean not null default false,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint center_verification_details_data_consent_check check (data_consent = true)
);

create index if not exists center_verification_details_email_lower_idx
  on public.center_verification_details (lower(reporter_email));

create table if not exists public.center_memberships (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.aid_centers (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique (center_id, user_id)
);

create index if not exists center_memberships_user_id_idx
  on public.center_memberships (user_id);

create table if not exists public.center_update_requests (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.aid_centers (id) on delete cascade,
  submitted_by_user_id uuid not null references auth.users (id) on delete cascade,
  status public.review_status not null default 'pending',
  proposed_data jsonb not null,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists center_update_requests_center_id_idx
  on public.center_update_requests (center_id);
create index if not exists center_update_requests_status_idx
  on public.center_update_requests (status);

create table if not exists public.center_events (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.aid_centers (id) on delete cascade,
  event_type public.center_event_type not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists center_events_center_type_time_idx
  on public.center_events (center_id, event_type, occurred_at desc);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  city text,
  department text,
  consent boolean not null default true,
  source text not null default 'public_updates_modal',
  created_at timestamptz not null default now(),
  unique (email)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
begin
  requested_role := coalesce(new.raw_app_meta_data ->> 'role', 'center_owner');

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case when requested_role = 'admin' then 'admin'::public.app_role else 'center_owner'::public.app_role end
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        role = excluded.role,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert or update of email, raw_app_meta_data, raw_user_meta_data
  on auth.users
  for each row execute function public.handle_new_auth_user_profile();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    or coalesce(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    );
$$;

create or replace function public.owns_center(target_center_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.center_memberships
    where center_id = target_center_id
      and user_id = auth.uid()
  );
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_aid_categories_updated_at
  before update on public.aid_categories
  for each row execute function public.set_updated_at();

create trigger set_aid_cities_updated_at
  before update on public.aid_cities
  for each row execute function public.set_updated_at();

create trigger set_aid_centers_updated_at
  before update on public.aid_centers
  for each row execute function public.set_updated_at();

create trigger set_center_verification_details_updated_at
  before update on public.center_verification_details
  for each row execute function public.set_updated_at();

create trigger set_center_update_requests_updated_at
  before update on public.center_update_requests
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.aid_categories enable row level security;
alter table public.aid_cities enable row level security;
alter table public.aid_centers enable row level security;
alter table public.center_verification_details enable row level security;
alter table public.center_memberships enable row level security;
alter table public.center_update_requests enable row level security;
alter table public.center_events enable row level security;
alter table public.newsletter_subscribers enable row level security;

create policy "profiles can read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "admins can update profiles"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "public can read active categories"
  on public.aid_categories for select
  to anon, authenticated
  using (is_active = true);

create policy "admins can manage categories"
  on public.aid_categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "public can read active cities"
  on public.aid_cities for select
  to anon, authenticated
  using (is_active = true);

create policy "admins can manage cities"
  on public.aid_cities for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "public can read approved centers"
  on public.aid_centers for select
  to anon, authenticated
  using (status = 'approved');

create policy "center owners can read own centers"
  on public.aid_centers for select
  to authenticated
  using (public.owns_center(id) or public.is_admin());

create policy "admins can manage centers"
  on public.aid_centers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins can read verification details"
  on public.center_verification_details for select
  to authenticated
  using (public.is_admin());

create policy "admins can manage verification details"
  on public.center_verification_details for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "members can read own memberships"
  on public.center_memberships for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "admins can manage memberships"
  on public.center_memberships for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "center owners can insert update requests"
  on public.center_update_requests for insert
  to authenticated
  with check (public.owns_center(center_id) and submitted_by_user_id = auth.uid());

create policy "center owners can read own update requests"
  on public.center_update_requests for select
  to authenticated
  using (public.owns_center(center_id) or public.is_admin());

create policy "admins can manage update requests"
  on public.center_update_requests for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "public can track approved center events"
  on public.center_events for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.aid_centers
      where id = center_id
        and status = 'approved'
    )
  );

create policy "center owners can read own center events"
  on public.center_events for select
  to authenticated
  using (public.owns_center(center_id) or public.is_admin());

create policy "public can subscribe to updates"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (consent = true);

create policy "admins can read subscribers"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.is_admin());

grant usage on schema public to anon, authenticated;

grant select on public.aid_categories to anon, authenticated;
grant select on public.aid_cities to anon, authenticated;
grant select on public.aid_centers to anon, authenticated;
grant insert on public.center_events to anon, authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert on public.center_update_requests to authenticated;
grant select on public.center_memberships to authenticated;
grant select on public.center_events to authenticated;

grant all on public.aid_categories to authenticated;
grant all on public.aid_cities to authenticated;
grant all on public.aid_centers to authenticated;
grant all on public.center_verification_details to authenticated;
grant all on public.center_memberships to authenticated;
grant all on public.center_update_requests to authenticated;
