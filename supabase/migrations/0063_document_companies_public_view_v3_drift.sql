-- ALSOUK — 0063: Document the "create_companies_public_view_v3" orphaned
-- migration-history entry.
--
-- Orphaned-migration audit (2026-08-19): the live migration history
-- (supabase_migrations.schema_migrations) has an entry named
-- "create_companies_public_view_v3" (applied 2026-08-15 21:29:57 UTC) with
-- no matching file anywhere in this repo's git history (any branch, any
-- commit) — unlike every other applied migration, which has a real file.
--
-- Root cause, confirmed (not guessed) by diffing the live database
-- against this repo's git history:
--   - "create_companies_public_view" (2026-08-15 21:20:17) is the same
--     session's first apply of what became 0046_create_companies_public_view.sql.
--   - "create_companies_public_view_v3" (2026-08-15 21:29:57, ~10 minutes
--     later, same session) is a follow-up iteration — 0046 already uses
--     `drop view if exists ... create view ...`, an idempotent pattern
--     built for exactly this kind of live iterate-and-reapply workflow.
--   - Verified live: `pg_get_viewdef('public.companies_public')` today
--     matches 0046's SELECT list column-for-column, and
--     `reloptions = {security_invoker=false}` matches 0047's later
--     `alter view ... set (security_invoker = false)` exactly.
--
-- Conclusion: this is migration-history bookkeeping noise from an
-- in-session "create, iterate, land on a final version" workflow — not an
-- undocumented schema difference. The live view is fully described by the
-- already-committed 0046 + 0047. No SQL action needed; this migration only
-- adds a comment so this specific orphaned history entry doesn't have to
-- be re-investigated from scratch next time someone diffs migration
-- history against the repo.
--
-- Idempotent: safe to re-run.

comment on view public.companies_public is
  'Definition and security_invoker=false setting fully match 0046_create_companies_public_view.sql '
  '+ 0047_restrict_companies_direct_select.sql (verified 2026-08-19). The live migration history also '
  'has an orphaned "create_companies_public_view_v3" entry (applied 2026-08-15 21:29:57 UTC, ~10 min '
  'after the first apply, same session, no matching file anywhere in git) — confirmed to be an '
  'in-session iteration step superseded by what 0046 already captures, not a separate undocumented '
  'schema state. See 0063_document_companies_public_view_v3_drift.sql.';
