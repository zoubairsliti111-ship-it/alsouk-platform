-- ALSOUK — 0065: Document the "exhibition_favorites_precise_policies"
-- orphaned migration-history entry.
--
-- Orphaned-migration audit (2026-08-19): the live migration history has an
-- entry named "exhibition_favorites_precise_policies" (applied
-- 2026-08-16 23:37:23 UTC) with no matching file in this repo.
--
-- Root cause, confirmed by diffing the live database against git history
-- and cross-referencing commit cc965a9's own message: "exhibition_visitor_tables"
-- (2026-08-16 23:25:08, ~12 minutes earlier, same session) is the first
-- apply of what became 0054_exhibition_visitor_tables.sql. That commit's
-- message explains the exhibition_favorites policies were deliberately
-- built as per-command (select/insert/delete) rather than `for all` —
-- "favorites are never updated, so `for all` would imply a phantom UPDATE
-- grant... caught by scripts/audit-rls-grants.sql on the first pass". The
-- 0054 file itself already shows explicit drop-then-create per-command
-- policies, meaning the correction happened live before the file was
-- finalized and committed — this orphaned entry is that live correction
-- step.
--
-- Verified live: all three exhibition_favorites policies ("Visitors
-- view/add/remove their own favorites") are per-command, roles =
-- {authenticated}, matching 0054's already-committed file exactly.
--
-- Conclusion: migration-history bookkeeping noise from an in-session
-- create-audit-fix cycle, not an undocumented schema difference. No SQL
-- action needed.
--
-- Idempotent: safe to re-run.

comment on policy "Visitors view their own favorites" on public.exhibition_favorites is
  'Per-command (not for all) policy matches 0054_exhibition_visitor_tables.sql exactly (verified '
  '2026-08-19). The live migration history also has an orphaned "exhibition_favorites_precise_policies" '
  'entry (applied 2026-08-16 23:37:23 UTC, ~12 min after table creation, same session, no matching file) '
  '— confirmed to be the audit-script-driven for-all-to-per-command correction described in commit '
  'cc965a9, already captured by 0054. See 0065_document_exhibition_favorites_precise_policies_drift.sql.';

comment on policy "Visitors add their own favorites" on public.exhibition_favorites is
  'Per-command (not for all) policy matches 0054_exhibition_visitor_tables.sql exactly (verified '
  '2026-08-19). See 0065_document_exhibition_favorites_precise_policies_drift.sql for the orphaned-'
  'migration-history explanation.';

comment on policy "Visitors remove their own favorites" on public.exhibition_favorites is
  'Per-command (not for all) policy matches 0054_exhibition_visitor_tables.sql exactly (verified '
  '2026-08-19). See 0065_document_exhibition_favorites_precise_policies_drift.sql for the orphaned-'
  'migration-history explanation.';
