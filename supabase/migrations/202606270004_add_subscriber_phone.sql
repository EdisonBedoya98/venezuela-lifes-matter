alter table public.newsletter_subscribers
  add column if not exists phone text;
