# ALSOUK — Project Status & Developer Handover

> Living handover document. If work stops, another developer (or an AI agent) should be able to
> continue ALSOUK from here **without asking questions**. Last updated on the
> `experience-polish` redesign branch (post PR #30).

---

## 1. Project overview

**Vision.** ALSOUK is a **mobile-first, AI-powered B2B marketplace** for the North-African trade
corridor (manufacturers, suppliers, wholesalers, importers, distributors, retailers — consumers are
secondary). It is **not** an Amazon-style storefront. The product goal is *"Alibaba for B2B ×
TikTok-style discovery"*: a living marketplace of suppliers, stores, products, RFQs, exhibitions and
market activity, where the AI assistant simplifies sourcing. Every screen must answer: *"Does this
make business easier for merchants?"*

**Architecture.** Next.js **App Router** (server + client components), rendering marketplace pages
that read from **Supabase** over the **PostgREST** REST interface using a server-side `fetch`
wrapper (`lib/supabase/rest.ts`). Credentials stay server-side; the browser only ever sees the
publishable/anon key. Domain logic is layered: `types → service (server) → client → component`.

**Tech stack.**
- **Next.js 16** (`16.2.6`), **React 19**, **TypeScript 5.7** (strict).
- **Tailwind CSS v4** (`@tailwindcss/postcss`) + `shadcn/tailwind.css` + `tw-animate-css`.
- **Base UI** (`@base-ui/react`) for the `Button` primitive; `class-variance-authority` for variants.
- **lucide-react** icons.
- **Supabase** (`@supabase/supabase-js` is installed but the app talks to PostgREST directly via `fetch`).
- **@vercel/analytics**; deployed on **Vercel**.
- i18n is a hand-rolled dictionary (`lib/i18n.ts`, `lib/directory-i18n.ts`) — EN / FR / AR + RTL.

**Current branch.** `devin/<timestamp>-experience-polish` (branched from `main` after PR #30 merged).
Redesign work (Discover tabs + infinite scroll, and in-progress social-commerce profile) lives here.

**Deployment status.** `main` auto-deploys to Vercel (`https://alsouk-platform.vercel.app`). Preview
deployments are created per PR. Production is confirmed working for the supplier directory + RFQ flow
(`/api/suppliers` returns live rows; `POST /api/rfqs` → 201; admin route → 401 without a token).
Marketplace tables (`companies/stores/products/...`) render **live once migration `0002` is applied**;
until then they show graceful empty states.

---

## 2. Completed work

Legend: ✅ Completed · 🟡 Partial · ❌ Not started

| Area | Status | What is implemented |
|---|---|---|
| **Homepage** | ✅ | Premium mobile-first "living marketplace": hero + search, live-activity marquee, categories, trending-products rail, featured suppliers (live `fetchSuppliers`), business opportunities, business shorts, recommended companies, trade shows, stats, RFQ CTA, AI CTA. Components under `components/home/*` + restyled section components. |
| **Discover** | ✅ | `/discover` TikTok-style vertical snap feed with category tabs (All / Factory / Product / Process), per-slide actions (View product, Visit supplier, Send RFQ, Contact→assistant, Save), and **infinite scroll** (IntersectionObserver cycling `t.discovery.items`). Presentation media only. |
| **Categories** | ✅ | `/categories` premium image cards + 2-col mobile grid. Reads live `fetchCategories`; presentation fallback when empty. Detail page `/categories/[slug]`. |
| **Suppliers (directory)** | ✅ | `/suppliers` live directory with search/filter drawer, cards, pagination-ready. Backed by `lib/supabase/suppliers-service.ts`. |
| **Products** | ✅ | `/products` listing + `/products/[id]` detail; `ProductCard`, `ProductGallery`. Reads `products` via `products-service`/`-client`. |
| **Supplier Store / profile** | ✅ | `/suppliers/[id]` storefront: cover, logo, Official-Store + Verified badges, quick stats, Overview / Categories / Products / Factory / Videos / Catalogs / Certifications / Reviews sections, Follow toggle (local), sticky mobile Request-Quote bar. Driven by `fetchSupplierById`. |
| **Company store** | ✅ | `/stores/[slug]` and `/companies` + `/companies/[slug]` read-only storefront over the marketplace schema. |
| **Product Details** | ✅ | Gallery, specs, MOQ/availability, price-or-Request-Quote, supplier card, related-products rail, Save toggle, sticky CTAs. (Social-commerce enhancements — variants/share — are the current in-flight task.) |
| **RFQ** | ✅ | Buyer quote form (`components/rfq/rfq-dialog.tsx`) on every Request-Quote CTA; marketplace-wide `/rfq` page; `POST /api/rfqs` with server validation + supplier link; token-gated admin at `/admin/rfqs` reading via service-role key. Table = `public.rfqs` (migration `0001`). |
| **Messages** | 🟡 | Route `/messages` exists as a `SoonScreen` placeholder. No chat UI or persistence yet (planned next). |
| **Account** | 🟡 | Route `/account` exists as a `SoonScreen` placeholder. No dashboard yet (planned next). |
| **AI Assistant** | 🟡 | Pluggable assistant widget (`components/ai/assistant-widget.tsx`) + `POST /api/ai` (`lib/ai/provider.ts`). **Safely disabled** until `AI_API_KEY` is set — shows "coming soon" fallback. Opened via `alsouk:open-assistant` window event. |
| **Navigation** | ✅ | Desktop `SiteHeader`/`SiteFooter` + mobile app-shell `MobileBottomNav` (Home/Discover/Categories/Messages/Account), safe-area aware, `lg:hidden`, active-state. Assistant launcher lifts above the nav. |
| **Responsive UI** | ✅ | Mobile-first throughout; horizontal rails on mobile → grids on desktop; large touch targets. |
| **RTL / LTR** | ✅ | `LanguageProvider` sets `dir`; components use logical `start/end` utilities + `rtl:` transforms. EN/FR/AR copy in `lib/i18n.ts` + `lib/directory-i18n.ts`. |
| **Supabase integration** | ✅ | PostgREST reads via `lib/supabase/rest.ts`; env handled in `lib/supabase/env.ts`. Auth/Storage/Realtime/Edge Functions **not** used. |
| **Authentication** | ❌ | No login, sessions, roles, or middleware. Only access control is the shared `RFQ_ADMIN_TOKEN` bearer on the admin API. This is the main blocker for member-only features. |
| **Database** | 🟡 | `suppliers` + `rfqs` are live in production. Marketplace schema (`0002`) + `0003` fix exist as migrations; apply in Supabase to go live. |
| **APIs** | ✅ | Route handlers for suppliers, companies, categories, products, stores, search, rfqs, admin rfqs, ai (see §3). |

---

## 3. Files changed / key files

> Not every file is listed — these are the ones a new developer needs to know. Everything under
> `app/`, `components/`, `lib/` and `supabase/` is application code.

### App routes (`app/`)
- `layout.tsx` — root layout, fonts, `<Analytics/>`, metadata base.
- `page.tsx` — homepage composition.
- `discover/page.tsx` — renders `DiscoverFeed` inside the marketplace shell.
- `categories/…`, `companies/…`, `products/…`, `stores/[slug]`, `suppliers/…`, `search/…`, `rfq/…` — marketplace pages (+ `layout.tsx` for per-section metadata).
- `messages/page.tsx`, `account/page.tsx` — `SoonScreen` placeholders (targets of upcoming work).
- `admin/rfqs/page.tsx` + `admin/layout.tsx` — token-gated RFQ admin.
- `sitemap.ts`, `robots.ts` — SEO.
- `api/*/route.ts` — server route handlers (suppliers, companies, categories, products, stores, search, rfqs, admin/rfqs, ai).

### Components (`components/`)
- **Shell/nav:** `marketplace/shell.tsx`, `site-header.tsx`, `site-footer.tsx`, `mobile-bottom-nav.tsx`, `soon-screen.tsx`.
- **Home:** `hero-section.tsx`, `categories-section.tsx`, `featured-products.tsx`, `featured-suppliers.tsx`, `rfq-section.tsx`, `stats-section.tsx`, `opportunities-section.tsx`, `business-discovery.tsx`, `export-tunisia.tsx`, `why-choose.tsx`, `testimonials-section.tsx`, and `home/*` (`live-activity`, `opportunities`, `business-videos`, `recommended-companies`, `trade-shows`, `ai-cta`).
- **Directory:** `directory/suppliers-directory.tsx`, `directory/directory-filters.tsx`, `directory/supplier-card.tsx`, `directory/supplier-profile.tsx`.
- **Marketplace:** `marketplace/companies-listing.tsx`, `company-card.tsx`, `company-details.tsx`, `categories-listing.tsx`, `category-details.tsx`, `products-listing.tsx`, `product-card.tsx`, `product-details.tsx`, `product-gallery.tsx`, `store-page.tsx`, `search-view.tsx`.
- **Discover:** `discover-feed.tsx` (category tabs + infinite scroll).
- **RFQ:** `rfq/rfq-dialog.tsx`, `rfq/rfq-request-page.tsx`, `admin/rfq-admin.tsx`.
- **AI / i18n:** `ai/assistant-widget.tsx`, `language-provider.tsx`.
- **UI primitives:** `ui/button.tsx` (Base UI + `buttonVariants`).

### Lib (`lib/`)
- `i18n.ts`, `directory-i18n.ts` — EN/FR/AR dictionaries (RTL-aware).
- `supabase/rest.ts` (PostgREST fetch wrapper), `supabase/env.ts`, `supabase/suppliers-service.ts`, `supabase/rfq-service.ts`.
- `domains/{company,category,product,store}/types.ts` — domain models.
- `services/*` — per-domain `-service.ts` (server) + `-client.ts` (browser) + `marketplace-api.ts`.
- `ai/provider.ts`, `directory-data.ts`, `format.ts`, `site.ts`, `utils.ts`.

### Database (`supabase/`)
- `migrations/0001_create_rfqs.sql`, `0002_create_marketplace.sql`, `0003_fix_companies_owner_id.sql`.
- `schema.sql` (mirror), `seed_marketplace.sql` (demo data).

### Docs / artifacts
- `AUDIT.md` — full technical audit (untracked working doc).
- `PROJECT_STATUS.md` — this file.

---

## 4. Current architecture

**UI organization.** Pages in `app/` are thin: they set metadata and render a feature component
wrapped in `MarketplaceShell` (which provides `LanguageProvider`, header, footer, mobile bottom nav
and the AI assistant). Feature components live in `components/<domain>/`.

**Reusable components.** `ui/button.tsx` (`Button` + `buttonVariants` — use `buttonVariants({…})` on
`Link` for link-buttons), `ProductCard`, `ProductGallery`, `CompanyCard`, supplier `Card/Stat/Row`
helpers, `SoonScreen`, and the `home/*` presentation blocks. **Reuse these — do not fork new
card/media components.**

**Routing.** Next.js App Router file-based routing. Dynamic segments: `[id]` (products, suppliers),
`[slug]` (companies, categories, stores). Per-section `layout.tsx` files own metadata.

**State management.** No global store. Local `useState`/`useEffect` per component. Language/`dir` is
shared through `LanguageProvider` (React context, persisted to `localStorage`). Data is fetched
client-side via the `*-client.ts` services (or server-side in route handlers).

**Data flow.** `component → services/*-client.ts → fetch('/api/<domain>') → app/api/*/route.ts →
services/*-service.ts → lib/supabase/rest.ts → PostgREST → Postgres`. RFQ writes: `rfq-dialog →
POST /api/rfqs → rfq-service (insert)`. Admin reads use the service-role key server-side only.

---

## 5. Remaining work (prioritized roadmap)

1. **Social-Commerce Company Profile (in progress).**
   - *Goal:* Instagram/TikTok-style, commerce-first profile with Posts/Products/Videos/Live/About tabs, social header (followers/following/counts), and member-only actions (Go Live, Edit, post CRUD).
   - *Files:* `components/directory/supplier-profile.tsx` (or a new `components/company/social-profile.tsx`), `lib/directory-i18n.ts`, possibly `lib/i18n.ts`.
   - *Difficulty:* Medium-High (UI). *Dependencies:* none for UI; real member gating + posts/videos persistence need **auth + schema**.
2. **Authentication + roles (Supabase Auth).**
   - *Goal:* Login/signup, sessions, `company.owner_id = auth.uid()` ownership; unlock member-only + messaging + account data.
   - *Files:* new `middleware.ts`, `lib/supabase/*`, auth UI, RLS already prepared in `0002`.
   - *Difficulty:* High. *Dependencies:* none (foundational).
3. **Messages (real).** Mobile chat, quote/product cards, attachments. *Files:* `app/messages/*`, new `components/messages/*`, new `messages` table + RLS. *Difficulty:* High. *Deps:* auth.
4. **Account dashboard (real).** RFQs, saved suppliers/products, orders, settings. *Files:* `app/account/*`, `components/account/*`. *Difficulty:* Medium. *Deps:* auth (+ a `saved`/`favorites` table).
5. **Posts / Videos / Live backend.** Tables + Storage buckets + upload flow. *Difficulty:* High. *Deps:* auth, Storage.
6. **Server-side directory pagination & SSR of catalogue** (perf/SEO). *Difficulty:* Medium.
7. **Cleanup / tech-debt** (see §6). *Difficulty:* Low.

---

## 6. Known issues / limitations / tech debt

- **No authentication** → all "member-only" (Go Live, Edit, post/video CRUD) and personalized
  (Messages, Account, Follow/Save persistence) features are **UI-only** until auth lands.
- **Follow / Save / Like / Comment** are local component state — not persisted.
- `next.config` has **`typescript.ignoreBuildErrors: true`** and **`images.unoptimized: true`** from the
  original scaffold — recommend enabling both properly + Supabase `remotePatterns`.
- **`left-pad`** is an unused dependency in `package.json` — safe to remove.
- `@supabase/supabase-js` is installed but unused (app uses raw PostgREST fetch).
- Marketplace pages show empty states until migration `0002` is applied in Supabase.
- Legacy unused `rfq_requests` table exists in production alongside `rfqs`.
- Duplicated/parallel homepage-section components exist (`business-discovery`, `export-tunisia`,
  `testimonials-section`, `why-choose` from a merged alt-homepage) that the current homepage does not
  compose — kept for reuse; candidates for cleanup.
- Directory currently fetches-all-then-filters client-side — will not scale to large datasets.
- Admin token comparison is not constant-time; PII responses should be `no-store`.
- `next-env.d.ts` / `tsconfig.tsbuildinfo` show up as modified locally (generated) — ignore/don't commit.

---

## 7. Database

**Supabase status.** Two tables are **live in production**: `suppliers` (public read) and `rfqs`
(insert-only; reads server-side via service-role). The marketplace schema is defined in migrations
but must be applied by a privileged user in the Supabase SQL editor.

**Migrations.**
- **`0001_create_rfqs.sql`** — `public.rfqs` (buyer quote submissions) with FK
  `supplier_id → suppliers.id`, indexes, RLS: insert-only (`Anyone can submit an RFQ`), **no public
  select** (rows hold buyer PII). Applied in production.
- **`0002_create_marketplace.sql`** — the marketplace foundation: `companies`, `stores`, `categories`,
  `company_categories`, `products`, `product_images`, `product_categories`. UUID PKs, FKs, indexes,
  `created_at`/`updated_at` (trigger-maintained), RLS on all tables (public read of catalogue,
  owner-scoped writes via `company.owner_id = auth.uid()`; `categories` admin-write only),
  Storage-ready `product_images` (`storage_bucket` + `storage_path` + cached `url`), one-primary-per-
  product enforced. **Apply this to light up `/companies`, `/products`, `/stores`, etc.**
- **`0003_fix_companies_owner_id.sql`** — **why it was added:** `0002` referenced/relied on
  `companies.owner_id` for owner-scoped RLS, but the column needed to be guaranteed present and
  indexed for future Supabase Auth ownership. `0003` adds `owner_id uuid REFERENCES auth.users(id) ON
  DELETE SET NULL` (idempotent, `IF NOT EXISTS`) plus `companies_owner_id_idx`. It repairs/completes
  the companies ownership wiring so auth can be layered on without another schema change.

**Tables (marketplace).** `companies` (merchant entity, `owner_id`), `stores` (branded storefront per
company), `categories` (+ `company_categories`, `product_categories` join tables), `products`,
`product_images` (Storage-ready). See `schema.sql` for the authoritative column list; `seed_marketplace.sql`
provides demo rows.

---

## 8. Design system

- **Colors** (OKLCH CSS vars in `app/globals.css`, `:root`): `--primary` = Blue `#2563EB`,
  `--accent`/`--brand-green` = Green `#16A34A`, plus `background/foreground/card/muted/secondary/
  border/ring` and `brand-blue`/`brand-green`. Consumed as Tailwind tokens (`bg-primary`,
  `text-accent`, `border-border`, …). Light color-scheme; dark variant scaffolded via `.dark`.
- **Typography:** `--font-sans` / `--font-serif` via CSS vars (set in root layout). Headings use bold
  tracking-tight; body uses muted-foreground for secondary text.
- **Radius:** `--radius: 0.75rem` with derived `--radius-sm…4xl`; UI favors `rounded-2xl`/`rounded-3xl`
  cards and `rounded-full` pills/CTAs.
- **Components:** Base UI `Button` with `buttonVariants` (`size`, `variant`); cards = `rounded-2xl
  border border-border bg-card shadow-sm`; pills = `rounded-full`.
- **Icons:** `lucide-react`, typically `size-4`/`size-5`, colored `text-primary`/`text-accent`.
- **Spacing:** container `max-w-6xl` (marketplace) / `max-w-md` (feed) with `px-4`; section vertical
  rhythm `py-8`; card padding `p-5`.
- **Mobile rules:** mobile-first; horizontal snap rails on mobile → grids ≥`sm`/`lg`; large touch
  targets (≥44px); fixed bottom nav is `lg:hidden` with `env(safe-area-inset-bottom)`; sticky CTAs sit
  **above** the bottom nav (`bottom-14`); all directional styles use logical `start/end` + `rtl:`.
  Custom `alsouk-marquee` keyframes + `.no-scrollbar` helper in `globals.css`.

---

## 9. Developer handover (start here)

1. **Install & run:** `npm install`, then `npm run dev` (http://localhost:3000).
2. **Env:** copy `.env.example`. Public: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (+ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). Server-only: `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `RFQ_ADMIN_TOKEN`, and optionally `AI_API_KEY` (+ `AI_BASE_URL`,
   `AI_MODEL`). **Never** prefix service-role/AI keys with `NEXT_PUBLIC_`.
3. **Database:** apply `supabase/migrations/0002` then `0003` in the Supabase SQL editor; optional
   `seed_marketplace.sql` for demo data. `0001` (rfqs) is already applied in prod.
4. **Validate before every commit:** `npx tsc --noEmit` → `npx eslint .` → `npm run build`. All three
   must pass. ESLint enforces `react-hooks/set-state-in-effect` — do **not** call `setState` directly
   in an effect body (move it into the async callback or an event handler).
5. **Conventions:** strict TS (no `any`/`getattr`-style access); imports at top; reuse existing
   components; additive i18n only (never mutate existing keys) in EN+FR+AR; logical `start/end` for
   RTL; link-buttons via `buttonVariants` on `Link`.
6. **Do NOT** modify backend/DB/API/auth/business logic unless the task explicitly calls for it. UI
   tasks are presentation-only; use presentational flags for member-only UI until auth exists.
7. **Git:** branch off `main` (`git checkout -b devin/<ts>-<name>`); one screen per commit; open a PR;
   keep CI (Vercel) green. Don't push to `main`.

---

## 10. Next recommended task

**Immediately after this doc: complete the Social-Commerce Company Profile redesign** (roadmap item
#1). Rework `components/directory/supplier-profile.tsx` into an Instagram/TikTok-style, commerce-first
profile:
- **Header:** cover, logo, name, verification badge, business type, city, followers/following
  (placeholder counts), total products/posts/videos; action buttons Follow / Message / Request Quote /
  Share, plus member-only Go Live / Edit Profile behind a presentational `isMember` flag.
- **Sticky tabs:** Posts / Products / Videos / Live / About — auto-hide empty tabs.
- **Products tab reuses `ProductCard`**; keep Request Quote + Message always visible; products one tap
  away. Presentation-only where there's no backend (posts/videos/live), honest empty states.
- Add EN/FR/AR keys additively; run tsc + eslint + build; open a PR.

**Then:** tackle **Supabase Auth + roles** (roadmap #2) to make member-only actions, Messages and the
Account dashboard real.
