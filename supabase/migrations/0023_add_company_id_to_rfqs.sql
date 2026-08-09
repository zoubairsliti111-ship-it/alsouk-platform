-- ALSOUK — 0023: Add `company_id` to public.rfqs.
--
-- SAFETY: Purely additive, nullable column. If it was already added in baseline,
-- this ADD COLUMN IF NOT EXISTS is completely safe.
--
-- Idempotent: safe to re-run.

alter table public.rfqs add column if not exists company_id uuid references public.companies (id) on delete set null;

create index if not exists rfqs_company_id_idx on public.rfqs (company_id);
