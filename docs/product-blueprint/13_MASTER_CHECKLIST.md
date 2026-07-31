# ALSOUK — PRODUCT MASTER CHECKLIST (13_MASTER_CHECKLIST)

**Author:** Chief Product Officer & Lead QA Architect
**Status:** Approved Product Blueprint
**Target Audience:** QA Engineers, DevOps, Lead Developers, Release Managers
**Document Scope:** Pre-Launch Checklist, Core Verification Parameters, and Production Readiness Standards

---

## 1. Authentication & Session Verification

- [ ] **Tunisian Phone-First Sign-Up:** Verify that typing an 8-digit Tunisian phone number successfully registers a user.
- [ ] **Synthetic Email Generation:** Confirm that `phoneToSyntheticEmail` correctly translates raw numbers to `phoneXXXXXXXX@alsouk.com`.
- [ ] **First-Login Role Prompt:** Confirm that the "Who are you?" role selection modal displays on the first login of a newly registered user.
- [ ] **Role Metadata Persistence:** Verify that the chosen role (Buyer/Supplier) is saved to the user's metadata and is not displayed again on subsequent sessions.
- [ ] **Client & Server Session Sync:** Ensure that login/logout transitions are synchronized across both client components and server middleware without requiring manual browser reloads.

---

## 2. Company Onboarding & Storefront Verification

- [ ] **3-Step Wizard Flow:** Confirm that Step 1, Step 2, and Step 3 of the company creation flow collect and validate all required inputs.
- [ ] **Input Sanitization:** Verify that strings and URL inputs are trimmed and sanitized.
- [ ] **Transaction Integrity:** Test that if the `company_members` join write fails, the entire company insertion is rolled back.
- [ ] **Automated Storefront Insertion:** Confirm that completing onboarding inserts a default matching entry inside `public.stores`.
- [ ] **Instant Catalog Addition:** Verify that completing onboarding immediately redirects the user to the "First Product" quick lister page.

---

## 3. Product Catalog & Currency Precision

- [ ] **Price Precision (TND):** Verify that prices in the catalog and details pages render in Tunisian Dinars with millimes formatting (3 decimal places, e.g., `25.500 د.ت`).
- [ ] **Exchange Rate Factor:** Confirm that base USD pricing correctly converts to TND using the active exchange factor (3.1 factor).
- [ ] **Minimum Order Quantity (MOQ):** Verify that MOQ is restricted to integers greater than or equal to 1.
- [ ] **No-Scrollbar Galleries:** Confirm that product detail views render catalog photos in a horizontal snapping carousel.
- [ ] **Defensive Profile Rendering:** Verify that empty sections (such as empty gallery arrays, certificates, or unsupported languages) are hidden on public company detail views.

---

## 4. Sourcing RFQ Engine & Moderation

- [ ] **Guest Sourcing Access:** Confirm that guest (unauthenticated) users can submit RFQs.
- [ ] **Pre-population Safeguards:** Verify that logged-in user metadata (Name, Phone number, Email) is automatically pre-filled in the RFQ wizard.
- [ ] **Data Security (RLS):** Test that Row-Level Security blocks public read access to `public.rfqs`, protecting buyer contact details from scrapers.
- [ ] **Admin Moderation Console:** Confirm that platform administrators can view, approve, and delete submitted RFQs inside the admin dashboard (`/admin/rfqs`).

---

## 5. UI Layout, Responsive, and Localization

- [ ] **Mobile-First 390px Constraints:** Confirm that all major pages render without horizontal layout breaks or clipping on standard mobile screens.
- [ ] **Sticky Bottom Navigation (70px):** Verify that the sticky navigation bar remains persistent and accessible within thumb-reach on mobile browsers.
- [ ] **Tajawal / Cairo Arabic Typography:** Test that Arabic typography is clear and that characters are not clipped on RTL layouts.
- [ ] **Logical Properties Check:** Confirm that margins, paddings, and borders use Tailwind's logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) to handle LTR/RTL dynamic orientations smoothly.
- [ ] **On-the-fly Toggling:** Verify that changing the language dynamically updates layout directions (`dir="ltr"` or `dir="rtl"`) across all active pages.

---

## 6. Pre-Production Performance & Server Build

- [ ] **Relative Fetch Resolution:** Verify that server-side fetches during build or SSG use absolute URLs (via `SITE_URL` from `@/lib/site` when `typeof window === "undefined"`) to prevent parse failures.
- [ ] **Next.js Production Compilation:** Run standard production build (`npm run build` or `pnpm build`) and verify it compiles without errors or warnings.
- [ ] **Codebase Linting:** Run standard code linting (`npm run lint` or `pnpm run lint`) and verify that all files conform to styling standards.
- [ ] **Lighthouse Performance Score:** Ensure mobile lighthouse scores exceed **90** on the homepage and core product details views.
