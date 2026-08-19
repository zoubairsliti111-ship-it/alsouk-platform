-- ALSOUK — 0059: lets a signed-in buyer be linked to the RFQ they submitted,
-- and lets a supplier update the status of RFQs addressed to their own
-- company (the missing piece for a real supplier RFQ inbox on
-- app/account/page.tsx — 0053 added SELECT, this adds the buyer identity
-- column and an UPDATE policy).
--
-- buyer_id is nullable on purpose: rfqs keeps its public, unauthenticated
-- submission path (`with check (true)` INSERT policy from 0001) — this only
-- captures the submitter's auth.uid() when they happen to be signed in, so
-- the supplier-side "Reply" action can open a real message thread with them.
-- Anonymous submissions (the common case today) simply leave buyer_id null;
-- the supplier UI falls back to the RFQ's freeform email/phone in that case.
--
-- The UPDATE policy mirrors 0053's SELECT policy exactly (same
-- is_company_manager(company_id) scoping) — a company can only ever change
-- the status of RFQs addressed to itself. This does not restrict which
-- columns can change at the RLS layer (Postgres RLS has no column-level
-- granularity), so the UI is responsible for only ever submitting a status
-- change; that's an application-level, not database-level, guarantee.
--
-- Idempotent: safe to re-run.

alter table public.rfqs add column if not exists buyer_id uuid references auth.users (id) on delete set null;
create index if not exists rfqs_buyer_id_idx on public.rfqs (buyer_id);

drop policy if exists "Company managers can update their RFQs" on public.rfqs;
create policy "Company managers can update their RFQs"
  on public.rfqs for update
  to authenticated
  using (company_id is not null and is_company_manager(company_id))
  with check (company_id is not null and is_company_manager(company_id));

grant update on public.rfqs to authenticated;
