# ALSOUK (SOUKI) — Project Handoff

B2B social-commerce platform for Tunisia / North Africa. Next.js + TypeScript,
Supabase (PostgreSQL), hosted on Vercel.

## Stack & repo
- GitHub: zoubairsliti111-ship-it/alsouk-platform (branch: main)
- Supabase project: "Alsouk" (project_id: jaqridxnfzrpluvjkldr)
- Production: alsouk-platform.vercel.app
- Build: `npx tsc --noEmit` then `npx next build --webpack` (Turbopack does
  NOT work on arm64/Termux — always use --webpack). A successful build is
  required before every deploy.

## Founding motivation
The owner created ALSOUK to directly answer the kind of sourcing questions
buyers currently post on Facebook (e.g. "where can I buy wholesale, price and
quality matter") — replacing that scattered search with a real B2B platform.

## Hard project rules (do not break these)
- **Never fabricate data.** No fake reviews, stats, demo content, or invented
  suppliers/products. If nothing matches, say so honestly.
- **Home page is strictly read-only.** No add/edit UI elements on `/`. All
  creation flows live in Studio / Account.
- **Never modify historical migrations** (0000–0032 as of this handoff).
  Schema changes are new, additive migrations numbered after the latest one.
- Simplicity first, mobile-first, no feature creep.
- A green build (tsc + next build) is required before shipping anything.

## What's been built (chronological, most recent last)

### External store link (Tier 1) + Shopify sync (Tier 2)
- `companies.external_store_url` — merchant can link their own existing
  online store; renders as a "Visit External Store" link on their public
  profile. **Confirmed working in production.**
- `company_store_integrations` table + `/api/integrations/shopify/*` routes —
  full server-side Shopify catalog sync exists in code (products.source /
  products.external_id track provenance), but the real sync flow was never
  fully tested end-to-end (blocked on installing a Shopify Dev Dashboard app;
  legacy custom apps were deprecated Jan 2026, new flow is more involved).
  DB structure is live in production; treat Tier 2 as code-complete but
  unverified.
- Two migrations (0028, 0029) were written by a prior Devin AI session but
  **never applied to production** despite the PR being merged — this caused a
  silent failure. Lesson: always verify `list_migrations` against what a PR's
  migration files actually contain before assuming a merge = deployed schema.

### Auto-generated storefront ("boutique auto-générée")
- **Already existed before this session**, mostly built: `stores` table
  (auto-created for every company on signup, see `createCompany` in
  `lib/supabase/company-service.ts`), `companies.website_mode` enum
  (`external` / `alsouk` / `both`), route `/stores/[slug]` with a full
  `StorePage` component (search, filters, MOQ, sort, featured products,
  external-mode redirect).
- What was missing and got added: a "Request Quote" button/modal on the
  storefront page (`components/marketplace/store-rfq.tsx`), reusing the
  already-framework-agnostic RFQ logic in `lib/supabase/rfq-service.ts`
  (`validateRfq`, `submitRfq`, `EMPTY_RFQ`).
- Every company gets a store automatically at signup — no manual "create my
  store" step is needed. The gap was only the RFQ entry point.

### AI Assistant (chatbot + smart search)
- Backend (`app/api/ai/route.ts`, `lib/ai/provider.ts`) and the frontend
  widget (`components/ai/assistant-widget.tsx`) already existed in the
  codebase, provider-agnostic (any OpenAI-compatible Chat Completions API).
  It just needed an API key.
- Activated with **Groq** (console.groq.com — free, no credit card,
  OpenAI-compatible endpoint). Env vars set on Vercel:
  - `AI_API_KEY` = (Groq secret key — rotate if this repo/zip is shared)
  - `AI_BASE_URL` = `https://api.groq.com/openai/v1`
  - `AI_MODEL` = `llama-3.3-70b-versatile`
- **Grounding**: `app/api/ai/route.ts` now calls `search()` (existing
  `lib/services/search-service.ts`) on the user's last message before
  replying, injects matching real companies/products as system context, and
  explicitly instructs the model never to invent suppliers not on the
  platform.
- **Smart search**: `lib/ai/provider.ts` gained `extractSearchKeywords()`,
  used by `app/api/search/route.ts` when a query has 4+ words (i.e. reads
  like a natural-language question rather than literal keywords). Extracted
  keywords are searched **individually and merged** (not as one contiguous
  phrase) — the AI often returns several distinct terms that won't appear
  together as a substring in any single listing. Falls back to the raw query
  if extraction finds nothing. Confirmed working in production against a real
  test product.

## UI cleanup
- Removed a duplicated "Open Studio" button in `app/account/page.tsx` (the
  Studio tab already did the same thing).

## Known gotcha: bash "!" history expansion
When writing files via `python3 -c "..."` with double quotes at the Termux
prompt, any `!` in the string (e.g. `if (!config)`) can trigger bash history
expansion (`event not found`), silently corrupting the written file with no
visible error in the python output. **Always write files via heredoc**
(`cat > path << 'EOF' ... EOF`, single-quoted delimiter) instead — it is never
subject to this problem.

## Deployment workflow used throughout
1. Edit files via Termux (heredoc for new/rewritten files, `python3` replace
   scripts or `sed`/`str_replace`-style edits for small changes — heredoc
   preferred for anything containing `!`).
2. `npx tsc --noEmit` then `npx next build --webpack` — both must pass clean.
3. `git add <files> && git commit -m "..." && git push` — Vercel auto-deploys
   on push to `main`.
4. For DB schema changes: check `list_migrations` on the Supabase project
   first, write additive migrations only, apply via the Supabase MCP tool or
   equivalent, and verify in production before considering it done.

## Not yet done / open threads
- Shopify Tier 2 sync: code exists, DB structure is live, but never verified
  against a real installed Shopify app + token (blocked on Shopify's Jan 2026
  Dev Dashboard changes).
- No real merchants/companies are registered yet beyond a test company.
- Company verification badge workflow is undecided.
