-- ALSOUK — 0023: Add `company_id` to public.rfqs.
-- Re-implements the intent of historical 0005 (never applied) as a new,
-- independent, additive migration. Does not modify 0000-0017.
--
-- SAFETY: purely additive, nullable column, no backfill needed (there is no
-- existing equivalent legacy data on `rfqs` to derive it from).
--
-- DEPENDS ON: 0019 (public.companies must exist, which it already does).
--
-- Idempotent: safe to re-run.

alter table public.rfqs add column if not exists company_id uuid references public.companies (id) on delete set null;

create index if not exists rfqs_company_id_idx on public.rfqs (company_id);
