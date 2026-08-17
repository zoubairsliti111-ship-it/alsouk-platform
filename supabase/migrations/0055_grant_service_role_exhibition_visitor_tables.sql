-- ALSOUK — 0055: grant service_role the table-level privileges it needs on
-- the three exhibition visitor tables added in 0054.
--
-- Same gap this project has hit repeatedly before (0031, 0036, 0039, 0043,
-- 0051): service_role's RLS bypass (BYPASSRLS) is a separate Postgres
-- privilege layer from the standard table-level GRANT, which 0054 never
-- issued for service_role — only for `authenticated`. exhibitions-
-- service.ts's getFavorites/addFavorite/removeFavorite, getMeetings/
-- createMeeting/updateMeetingStatus/rescheduleMeeting, and
-- getVisitorNotes/saveVisitorNote/deleteVisitorNote all read/write these
-- tables via getServiceClient() (the service-role client), so every one
-- of them was failing with "permission denied for table ..." — confirmed
-- live via a real POST to production before this fix.
--
-- scripts/audit-rls-grants.sql did not catch this because it only checks
-- anon/authenticated grants implied by RLS policies, not service_role —
-- documented in its own header as a known gap, not something it claims
-- to cover.
--
-- Idempotent: safe to re-run.

grant select, insert, update, delete on public.exhibition_favorites to service_role;
grant select, insert, update, delete on public.exhibition_visitor_notes to service_role;
grant select, insert, update, delete on public.exhibition_meetings to service_role;
