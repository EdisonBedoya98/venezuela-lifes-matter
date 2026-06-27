create extension if not exists pgcrypto;

create table if not exists public.volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  center_id text not null,
  center_name text not null,
  city_id text not null,
  city_name text not null,
  full_name text not null,
  email text not null,
  phone text not null,
  volunteer_city text not null,
  availability text not null,
  support_areas text[] not null default '{}',
  message text,
  share_consent boolean not null default false,
  status text not null default 'new' check (status in ('new', 'shared', 'contacted', 'archived')),
  created_at timestamptz not null default now()
);

alter table public.volunteer_applications enable row level security;

create index if not exists volunteer_applications_center_id_idx
  on public.volunteer_applications (center_id);

create index if not exists volunteer_applications_created_at_idx
  on public.volunteer_applications (created_at desc);

comment on table public.volunteer_applications is
  'Private volunteer applications submitted for a specific aid center. Inserts are performed server-side with the service role key.';
