-- ALSOUK — 0047: Close the raw companies table exposure companies_public
-- (0046) documented but deliberately didn't fix — closing it now.
--
-- companies' SELECT policy was `using (true)`: full row, every column,
-- readable by literally anyone (including anon) via direct REST, same
-- severity as profiles.phone before public_profiles_view — except worse,
-- since companies has no row restriction at all, not even one gated by a
-- relationship. tax_identifier, license_document_url, business_email and
-- every unrevealed *_visible-gated field were reachable by bypassing
-- companies_public entirely and querying the base table.
--
-- Unlike profiles, companies is *meant* to have a wide-open public case —
-- the whole point of the directory is that any visitor can find any
-- company. So the fix here is the opposite shape from what would be safe
-- for profiles: restrict the BASE TABLE's direct-SELECT row policy to
-- "you're a member of this company" (is_company_member — same helper
-- already used for posts/live_sessions, broader than is_company_manager:
-- owner or any company_members row, any role, matching what
-- app/studio/page.tsx already treats as sufficient for self-service
-- access), and let companies_public bypass that restriction entirely by
-- dropping its security_invoker flag — a non-invoker view runs with the
-- table owner's privileges, and table owners bypass RLS by default (no
-- FORCE ROW LEVEL SECURITY is set on companies), so the view keeps
-- serving the public directory exactly as before regardless of this
-- tightened base-table policy. This is the reverse of profiles: there,
-- flipping security_invoker off would leak every row to everyone (no
-- "wide public" case exists to preserve); here, it's required to keep the
-- wide public case working while the raw table locks down.
--
-- Own/member row access still returns every column via direct SELECT —
-- this only removes the previous "no restriction at all" case, not
-- legitimate self-service (RLS gates rows, not columns; grants are
-- unchanged).
--
-- Idempotent: safe to re-run.

drop policy if exists "Companies are publicly readable" on public.companies;

drop policy if exists "Members can view their own company" on public.companies;
create policy "Members can view their own company"
  on public.companies for select
  using (is_company_member(id));

alter view public.companies_public set (security_invoker = false);
