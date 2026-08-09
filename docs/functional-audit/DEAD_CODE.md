# ALSOUK — DEAD CODE & REPLICANT SYSTEM REVIEW

This document identifies unused, duplicate, or legacy code components, endpoints, and database models.

---

## 1. Redundant & Duplicate Database Schemas

### 1.1 Legacy Directory (`suppliers`) vs Modern Marketplace (`companies`)
* **Finding:** The database contains both `public.suppliers` and `public.companies`.
* **Details:** `suppliers` holds flat entries from the legacy directory design. The modern marketplace uses `companies` with recursive multi-ownership support and progressive tiers.
* **Remediation:** Migrating the older supplier data entirely to the companies table will eliminate twin-query logic.

### 1.2 Dual Post Implementations (`posts` vs `commercial_posts`)
* **Finding:** Both `public.posts` and `public.commercial_posts` exist in migrations.
* **Details:** `posts` (with `post_likes`, `post_comments`) was created in `0015_social_commerce.sql`, while `commercial_posts` (with `commercial_post_media`, `commercial_post_likes`, etc.) was created in `0017_commercial_posts_and_dependencies.sql`.
* **Remediation:** Consolidate actions entirely onto the `commercial_posts` table and deprecate the legacy `posts` table.

---

## 2. Unused Client-Side Helper Files

### 2.1 Removed Duplicate Client (`lib/supabase/browser.ts`)
* **Finding:** The codebase previously contained a duplicate browser client helper.
* **Remediation:** This was successfully removed, and all operations were unified under `lib/supabase/client.ts` to ensure single client memoization per tab.

### 2.2 Unused Supplier Directory Service (`lib/supabase/suppliers-service.ts`)
* **Finding:** Service wrapper that queries the legacy `suppliers` table.
* **Details:** Since public storefronts and listings have transitioned to relational company models, this service wrapper is mostly bypassed.
