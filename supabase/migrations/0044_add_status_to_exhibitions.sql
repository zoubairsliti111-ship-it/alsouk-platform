-- ALSOUK — 0044: Persist exhibition status.
--
-- `exhibitions` had no `status` column at all. updateExhibitionStatus()
-- wrote to an in-memory `globalThis.__exhibitionStatusOverrides` dict
-- instead — every status change (Draft/Published/Open/Closed/Archived) was
-- silently lost on the next server restart or serverless cold start, and
-- every exhibition without a live override read back as the hardcoded
-- default "Published" regardless of its actual lifecycle stage. Not a mock
-- data issue in the usual sense — worse: a feature that looked like it
-- persisted but never actually wrote to the database.
--
-- Default matches the exact fallback the in-memory version used
-- (`overrides[row.id] || "Published"`), so existing rows behave
-- identically to before until someone explicitly changes their status.
--
-- Idempotent: safe to re-run.

alter table public.exhibitions
  add column if not exists status text not null default 'Published';

alter table public.exhibitions
  drop constraint if exists exhibitions_status_check;

alter table public.exhibitions
  add constraint exhibitions_status_check
  check (status in ('Draft', 'Published', 'Archived', 'Open', 'Closed'));
