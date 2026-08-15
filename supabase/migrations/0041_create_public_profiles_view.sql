-- ALSOUK — 0041: Column-level guard for profiles: public_profiles_view.
--
-- profiles has phone, country, city, company_name, user_type alongside
-- full_name/avatar_url. RLS is row-level only — every SELECT policy that
-- grants a row (own profile / message partners / live chat participants,
-- see 0034 and 0040) exposes the *entire* row, including phone, to anyone
-- who queries the base table with an explicit column list. Every real
-- consumer of "someone else's" profile in this codebase (use-live-chat.ts,
-- messages-service.ts resolveParticipant, and the media-comment author
-- lookups in app/studio/page.tsx, components/studio/studio-panel.tsx,
-- app/suppliers/[id]/feed/page.tsx) only ever needs id/full_name/avatar_url
-- — never phone or the rest. This view is that narrower surface.
--
-- security_invoker = true is required here: without it, a view runs with
-- the view owner's privileges and — critically — the owner's RLS bypass
-- (table owners skip RLS by default), which would silently make this view
-- return every profile row to everyone, not just the caller's own/message
-- partner/live-chat rows. With security_invoker, the view is a pure column
-- projection: whichever rows the *calling* role could already see on
-- `profiles` directly (via its existing RLS policies) are exactly the rows
-- visible here, just without phone/country/city/company_name/user_type.
--
-- This view does NOT replace the profiles RLS policies — it has no row
-- filter of its own, so it grants zero additional row access beyond what
-- those policies already allow. It's a column-level guard stacked on top of
-- row-level security, not a substitute for it. The "Users can view live
-- chat participants profiles" policy from 0040 stays: removing it would
-- also break name resolution through this view, not just through the base
-- table.
--
-- Idempotent: safe to re-run.

create or replace view public.public_profiles_view
with (security_invoker = true) as
select id, full_name, avatar_url
from public.profiles;

grant select on public.public_profiles_view to anon, authenticated, service_role;
