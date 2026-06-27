-- Clear all registered aid centers and related operational data.
--
-- Keeps:
-- - public.aid_categories
-- - public.aid_cities
-- - auth.users
-- - public.profiles
-- - public.newsletter_subscribers
--
-- Deletes:
-- - public.aid_centers
-- - public.center_verification_details
-- - public.center_memberships
-- - public.center_update_requests
-- - public.center_events
--
-- Run in the project SQL editor before starting a clean registration batch.

begin;

truncate table
  public.center_events,
  public.center_update_requests,
  public.center_memberships,
  public.center_verification_details,
  public.aid_centers
restart identity cascade;

commit;
