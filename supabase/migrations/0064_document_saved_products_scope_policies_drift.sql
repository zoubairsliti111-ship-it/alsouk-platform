-- ALSOUK — 0064: Document the "saved_products_scope_policies_to_authenticated"
-- orphaned migration-history entry.
--
-- Orphaned-migration audit (2026-08-19): the live migration history has an
-- entry named "saved_products_scope_policies_to_authenticated" (applied
-- 2026-08-16 01:12:36 UTC) with no matching file in this repo.
--
-- Root cause, confirmed by diffing the live database against git history
-- and cross-referencing commit b27bc30's own message: "create_saved_products"
-- (2026-08-16 01:10:46, ~2 minutes earlier, same session) is the first apply
-- of what became 0048_create_saved_products.sql. That commit's message
-- describes running scripts/audit-rls-grants.sql immediately after — "first
-- pass did flag anon (policies defaulted to `public` role before I scoped
-- them explicitly)" — i.e. the policies were created once, the audit script
-- caught an anon-role gap, and they were corrected to `to authenticated` in
-- a second live apply. That correction is this orphaned entry.
--
-- Verified live: all three saved_products policies
-- ("Users view/save/remove their own saved products") have
-- roles = {authenticated} today, matching 0048's already-committed file
-- exactly — 0048 already reflects the corrected end state.
--
-- Conclusion: migration-history bookkeeping noise from an in-session
-- create-audit-fix cycle, not an undocumented schema difference. No SQL
-- action needed.
--
-- Idempotent: safe to re-run.

comment on policy "Users view their own saved products" on public.saved_products is
  'to authenticated scoping matches 0048_create_saved_products.sql exactly (verified 2026-08-19). The '
  'live migration history also has an orphaned "saved_products_scope_policies_to_authenticated" entry '
  '(applied 2026-08-16 01:12:36 UTC, ~2 min after table creation, same session, no matching file) — '
  'confirmed to be the audit-script-driven anon-to-authenticated correction described in commit b27bc30, '
  'already captured by 0048. See 0064_document_saved_products_scope_policies_drift.sql.';

comment on policy "Users save products as themselves" on public.saved_products is
  'to authenticated scoping matches 0048_create_saved_products.sql exactly (verified 2026-08-19). See '
  '0064_document_saved_products_scope_policies_drift.sql for the orphaned-migration-history explanation.';

comment on policy "Users remove their own saved products" on public.saved_products is
  'to authenticated scoping matches 0048_create_saved_products.sql exactly (verified 2026-08-19). See '
  '0064_document_saved_products_scope_policies_drift.sql for the orphaned-migration-history explanation.';
