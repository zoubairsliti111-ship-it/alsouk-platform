-- ALSOUK — 0030: Add banner_url to companies.
--
-- Reconstructed from the live production schema (this migration was applied
-- directly to Supabase before it was ever committed to the repo — see the
-- CURRENT_STATE_AUDIT.md finding on migration/schema drift). The column
-- already exists in production; this file exists so the tracked migration
-- history matches what's actually deployed.
--
-- Idempotent: safe to re-run.

alter table public.companies
  add column if not exists banner_url text;
