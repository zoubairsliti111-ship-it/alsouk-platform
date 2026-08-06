-- ALSOUK — 0018: Add unified `name` and `description` columns to public.companies.
--
-- WHY: The application code (lib/services/companies-service.ts,
-- lib/supabase/company-service.ts) reads/writes `row.name` and `row.description`
-- exclusively. Production `companies` currently only has `company_name` and
-- `description_ar` / `description_fr` / `description_en`. This migration adds
-- the columns the code needs and backfills them from existing data — it does
-- NOT drop or rename any existing column, so nothing that reads `company_name`
-- or the trilingual description columns today is affected.
--
-- SAFETY:
--   * Purely additive (ADD COLUMN IF NOT EXISTS). Re-runnable.
--   * No NOT NULL constraint is added here — some historical rows could in
--     theory have a null `company_name`, and forcing NOT NULL could fail the
--     migration outright. Tighten to NOT NULL in a later migration only after
--     confirming (via a SELECT) that every row now has a non-null `name`.
--   * ASSUMPTION (flagged for confirmation): `description` is backfilled from
--     `description_ar` as the primary market language (Tunisia). If a
--     different source language is preferred, this line should be changed
--     before running on production.
--   * Does not touch migrations 0000-0017. This is a new, independent file.
--
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- Shared `updated_at` trigger helper, used by every `*_set_updated_at`
-- trigger across this new migration set (0019, 0020, 0021, 0022, 0024,
-- 0026, 0027). CONFIRMED MISSING FROM PRODUCTION: this function was
-- originally defined inside the historical 0002_create_marketplace.sql,
-- but since that whole migration failed and rolled back atomically (the
-- function's CREATE statement was never committed — verified directly via
-- `select proname from pg_proc where proname = 'set_updated_at'` returning
-- zero rows), it does not exist today. Defined here, first, so every later
-- new migration in this set can rely on it.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.companies add column if not exists name text;
alter table public.companies add column if not exists description text;

-- Backfill from existing legacy columns. Only fills rows where the new
-- column is still null, so re-running this migration never overwrites a
-- value that was already set by a later, real update.
update public.companies
set name = company_name
where name is null
  and company_name is not null;

-- ASSUMPTION: description_ar chosen as the backfill source. Change to
-- description_fr / description_en here if that is the intended primary
-- language for the unified `description` field.
update public.companies
set description = description_ar
where description is null
  and description_ar is not null;

create index if not exists companies_name_idx on public.companies (name);
