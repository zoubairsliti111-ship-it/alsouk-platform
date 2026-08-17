-- ALSOUK — 0053: lets a real company owner/admin see the RFQs directed at
-- their own company (the "RFQs Matching" stat on app/account/page.tsx and
-- any future supplier RFQ inbox).
--
-- rfqs has always had exactly one policy — "Anyone can submit an RFQ"
-- (INSERT only, `with check (true)`) — and RLS enabled with zero SELECT
-- policies. That's correct for the public submission form, but it also
-- means a supplier's own authenticated session can never see RFQs whose
-- company_id points at their own company: app/account/page.tsx's rfqsCount
-- query (`.from("rfqs").select(...).eq("company_id", currentCompanyId)`)
-- has always silently returned zero rows, not because there are no
-- matching RFQs, but because no SELECT policy exists at all.
--
-- Scoped with is_company_manager (same helper already used for products/
-- companies self-service) so a company only ever sees RFQs addressed to
-- itself — general marketplace-wide RFQs (company_id is null) and RFQs
-- addressed to other companies stay invisible.
--
-- Idempotent: safe to re-run.

drop policy if exists "Company managers can view their RFQs" on public.rfqs;
create policy "Company managers can view their RFQs"
  on public.rfqs for select
  to authenticated
  using (company_id is not null and is_company_manager(company_id));

grant select on public.rfqs to authenticated;
