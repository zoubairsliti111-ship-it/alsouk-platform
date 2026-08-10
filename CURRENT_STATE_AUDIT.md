# ALSOUK — Current State Engineering Audit

Date: this session. Method: direct inspection of app/, components/, lib/,
supabase/migrations/, git log, and the live Supabase project — not based on
prior documentation. Where docs (HANDOFF.md, PROJECT_STATUS.md,
MIGRATION_REVIEW.md, DEVIN_BRANCH_AUDIT.md) conflict with the code, the code
wins and the conflict is noted below rather than assumed away.

**Scope note:** this audit is not exhaustive — it covers what was directly
inspected in this session (see method notes per section). Anything not
explicitly checked is marked "not verified" rather than assumed working.

## A. Executive Summary

The MVP is further along than a quick glance suggests: Stores, RFQ, External
Store links, Smart Search, and the AI Assistant are real, wired end-to-end,
and confirmed working in production. But three things need attention before
calling this launch-ready:

1. **Messaging does not exist.** `/messages` is a static "Coming Soon" screen.
   No service, no table usage, no logic. This was listed as a 4.5-star
   priority feature in the charter and is not started.
2. **Exhibitions still uses mock data in live API routes** (`getMockExhibits`,
   `getMockBooths`) as a fallback or primary source in at least two endpoints.
3. **Migration/schema drift**: the Supabase project has migrations
   `0030_add_banner_url_to_companies`, `0031_critical_grant_missing_table_privileges`,
   and `0032_add_rate_limit_to_rfqs` applied in production, but these three
   files do **not exist** in the local `supabase/migrations/` folder (which
   stops at `0029`). Either they were applied directly without being
   committed, or they exist on a branch that was never merged. Either way,
   the tracked migration history does not match what's actually running.

## B. What's actually been accomplished (this session + recent git history)

Confirmed via git log and direct testing:
- External Store link (Tier 1): working in production, tested with a real URL.
- Stores auto-created per company at signup, storefront page `/stores/[slug]`
  with search/filter/RFQ: working, tested.
- AI Assistant (Groq-backed, grounded in real DB search): working, tested.
- Smart search with AI keyword extraction: working, tested (individual
  keyword matching, not phrase matching).
- Several honesty fixes already landed before this session (per git log):
  removed fake hero stats ("12,000+ suppliers"), removed a fabricated "feed
  simulation" with fake likes, fixed a fake fallback bio on new profiles,
  fixed Follow/Unfollow to actually persist, renamed a misleading "Activate
  Supplier Space" button.

## C. Features confirmed complete (✅)

- External Store Link (Tier 1) — `companies.external_store_url`, tested live.
- Auto-generated Store (`/stores/[slug]`) — search, filters, MOQ, sort,
  featured products, RFQ button. Tested live with a real product.
- RFQ creation from company profile and from store page — real
  `validateRfq`/`submitRfq` → `/api/rfqs` → Supabase, shared logic, tested.
- AI Assistant chat — real provider call (Groq), grounded in real `search()`
  results, tested live with Arabic queries.
- Smart Search — natural-language query → AI keyword extraction → per-keyword
  DB search → merged results, tested live.
- Company/product/supplier text search (`/api/search`, `search-service.ts`) —
  real PostgREST `ilike` queries, no mock data found in this path.

## D. Features partially built (🟡 needs testing or has gaps)

- **Shopify sync (Tier 2)** — full code path exists (`company_store_integrations`
  table, `/api/integrations/shopify/*`, admin API client), DB structure is
  live in production, but the real end-to-end sync was never verified with an
  installed app + working token (blocked earlier this session on Shopify's
  new Dev Dashboard flow). Status: code-complete, unverified.
- **Verified badge (`companies.verified`)** — column exists and is read in
  the UI (e.g. "Verified Supplier" badge logic ties to `websiteMode` +
  company data in `store-page.tsx`), but no workflow was found that actually
  sets this flag (no admin verification UI/API located in this pass). Needs
  confirmation of how/if it's ever set to true outside direct DB edits.
- **Notifications** — table and API routes exist
  (`/api/notifications/*`, `notifications` table from migration 0025), not
  independently verified this session whether the UI consumes real rows vs.
  any fallback. Flagged for follow-up, not confirmed either way.

## E. Features not built (🔴)

- **Messaging / Business Messaging.** `app/messages/page.tsx` renders only a
  `SoonScreen` ("Coming Soon") component. No `lib/` service file matching
  "messag*" was found. This is a named MVP feature (4.5-star priority in the
  charter) with zero implementation.

## F. Mock / Placeholder Audit

- `app/api/exhibitions/booth/exhibits/[id]/route.ts` — imports and actively
  uses `getMockExhibits()` as a fallback (and in one branch, primary) data
  source alongside real DB lookups.
- `app/api/exhibitions/organizer/booths/route.ts` — uses `getMockBooths()[slug]`
  as a fallback when no real booths are found.
- `app/api/exhibitions/visitor/qr/route.ts` — comment indicates it generates a
  "mock SVG/DataURI" for booth QR codes rather than a real QR encoding.
- A broad grep for mock/placeholder/TODO/hardcoded returned 699 hits total;
  most inspected instances were comments documenting *past* fixes (i.e. code
  that used to be fake and was corrected — a good sign, not a problem), but
  the Exhibitions mock functions above are live code paths, not comments.
- No mock data was found in the Stores, RFQ, Search, or AI Assistant code
  paths touched this session.

## G. Database & Migration Audit

- Local `supabase/migrations/` contains 30 files: `0000` through `0029`.
- Supabase production has 19 migrations recorded as applied, going up to
  `0032`, including three (`0030`, `0031`, `0032`) that have **no
  corresponding file in the local repo**.
- Two pairs of duplicate migration numbers exist in production history
  (`0028`/`0029` appear twice each, with different content — one set from the
  original 2026-08-06 batch, one set from the 2026-08-09 Devin/Shopify
  commit). Supabase tracks these by full timestamp version, not the filename
  prefix, so this did not break anything technically, but the numbering is
  confusing and should not be repeated.
- Both `0028_add_external_store_url_to_companies.sql` and
  `0029_create_shopify_store_sync.sql` were manually applied to production
  during this session after being found merged in git but never deployed to
  the database — this exact failure mode (migration file merged, never
  applied) is what produced the `0030`–`0032` gap noted above; it likely
  happened the same way and was never caught.
- RLS policy review: not exhaustively checked this session beyond what was
  read for `company_store_integrations` (RLS + column-level lockdown on
  `access_token`, confirmed sound). Other tables' RLS policies not
  individually re-verified.

## H. Authentication & Security Audit

- Not verified this session: rate limiting behavior (migration
  `0032_add_rate_limit_to_rfqs` exists in production per Supabase but the SQL
  itself was not read this pass), password breach protection (a Supabase Auth
  dashboard setting, not visible from migrations), and Supabase Auth
  configuration generally.
- Confirmed sound: `company_store_integrations.access_token` is protected by
  RLS + a column-level `REVOKE` from `anon`/`authenticated`, service-role only
  — reviewed directly in migration 0029 (external store version).

## I. API / Service Audit

- `search-service.ts` — single, non-duplicated search implementation used by
  both `/api/search` and now the AI grounding logic. No duplicate search
  logic found.
- Exhibitions module has the largest API surface (20+ routes) and is also
  where the only confirmed mock-data usage lives — worth a dedicated pass.
- No duplicated RFQ logic — `lib/supabase/rfq-service.ts` is shared between
  the company profile modal and the new store RFQ button.

## J. TypeScript / Lint / Build / Test Results

- `npx tsc --noEmit` — passing, no errors, as of the last commit
  (`3ae499f`) made in this session.
- `npx next build --webpack` — passing (~60-70s builds throughout this
  session, 46/46 static pages generated, no errors).
- Lint: not run this session — not yet executed as part of this audit.
- Automated tests: no test suite was located or run this session; presence
  of one was not independently confirmed.

## K. Technical Debt

- Migration numbering collision (duplicate 0028/0029) — cosmetic but
  confusing; avoid reusing numbers going forward.
- Migration/production drift (0030-0032 missing locally) — needs
  reconciliation: either commit the missing files or document that they were
  applied out-of-band.
- Exhibitions mock-data fallbacks — either finish real data wiring or clearly
  gate mock fallbacks behind a dev-only flag so they can't silently serve in
  production.

## L. Documentation Inconsistencies

- `HANDOFF.md` (written this session) reflects this session's work
  accurately as of its creation but does not cover Exhibitions/Messaging
  gaps found afterward in this audit — should be read alongside this file,
  not instead of it.
- `PROJECT_STATUS.md`, `MIGRATION_REVIEW.md`, `DEVIN_BRANCH_AUDIT.md` exist in
  the repo but were **not read in this pass** (found via `ls *.md` late in
  the audit) — their claims are not yet cross-checked against this report.
  Flagged as a follow-up, not a contradiction, since no comparison was made.

## M. Production-Readiness Assessment

Not production-ready for a full public launch with paying/real merchants
expecting messaging, given that a named core feature (Messaging) does not
exist. It **is** in reasonable shape for a limited/soft launch centered on
Stores + RFQ + Search + AI Assistant, which are all real and tested, as long
as Messaging is either built first or explicitly descoped/hidden from the UI
for this phase.

## N. Top issues by severity

1. **Messaging is entirely unbuilt** despite being a named MVP feature — highest
   severity if messaging is expected at launch.
2. **Migration/production drift** (0030-0032 missing from repo) — real risk of
   someone re-running the same "commit exists but was never applied" mistake
   found and fixed twice already this session.
3. **Live mock data in Exhibitions API routes** — could serve fabricated booth
   data to real users, contradicting the project's own "no fake data" rule.
4. **Verified badge workflow unconfirmed** — unclear how a company legitimately
   becomes "Verified" in production.
5. **Security items not verified this session** (rate limiting content, breach
   protection, full RLS sweep) — not proven broken, just not proven sound.

## O. First 5 suggested tasks (finishing the MVP, not adding features)

1. Reconcile migrations 0030-0032: commit the missing SQL files to the repo
   (pull the exact applied SQL from Supabase) so local history matches
   production.
2. Decide Messaging's fate for this launch: either scope and build a minimal
   real version, or remove/relabel the nav entry so it doesn't advertise a
   feature that doesn't exist.
3. Replace or explicitly gate the Exhibitions mock-data fallbacks
   (`getMockExhibits`, `getMockBooths`) so they can never serve in production.
4. Read `PROJECT_STATUS.md`, `MIGRATION_REVIEW.md`, and `DEVIN_BRANCH_AUDIT.md`
   and cross-check their claims against this audit; reconcile or flag
   contradictions explicitly rather than trusting either source blindly.
5. Verify the "Verified Supplier" badge workflow end-to-end, or document that
   it is currently owner/admin-set only with no self-serve path.
