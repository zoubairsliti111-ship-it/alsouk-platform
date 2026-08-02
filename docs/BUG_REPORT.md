# ALSOUK — COMPREHENSIVE BUG REPORT & REMEDIATION

**Date:** August 2026
**Document:** Official Project Bug Registry
**Auditor:** Lead Software Architect (Jules)

---

## 1. Verified Bugs and Technical Risks

Every verified issue, risk, and behavioral gap identified in the repository is cataloged here with its priority, root cause, and remediation plan.

### Bug 1: Dual Database Schema Coexistence (Parallel Logic)
- **Priority:** **HIGH**
- **Description:** The legacy `suppliers` directory schema coexists alongside the modern `companies` / `stores` marketplace schema. This creates dual query paths and code duplicates across older components and new views.
- **Root Cause:** Legacy directory features were not migrated when the marketplace tables were designed, leaving two tables representing business entities.
- **Files Involved:**
  - `lib/services/companies-service.ts`
  - `lib/supabase/suppliers-service.ts`
  - `app/suppliers/page.tsx`
  - `app/companies/page.tsx`
- **Database Tables Involved:** `public.suppliers`, `public.companies`
- **Suggested Fix:** Execute a database migration merging all remaining `suppliers` rows into `companies` and update references in directory pages to query `companies` instead. Deprecate the `suppliers` table.

### Bug 2: Missing Real-Time Messaging Schema
- **Priority:** **HIGH**
- **Description:** The `/messages` route is present but is restricted to a `SoonScreen` placeholder because there is no persistent backend or table schema to support chat histories.
- **Root Cause:** SOUKI chat persistence has not been defined in migrations.
- **Files Involved:**
  - `app/messages/page.tsx`
- **Database Tables Involved:** None (missing table)
- **Suggested Fix:** Create a migration script establishing `public.conversations` and `public.messages` tables with RLS and configure Supabase Realtime broadcast channels.

### Bug 3: Hardcoded Exchange Rate Constant
- **Priority:** **MEDIUM**
- **Description:** Converting currency index prices from USD to Tunisian Dinar (TND) uses a static hardcoded `3.1` multiplier constant. This leads to drift over time as currency values fluctuate.
- **Root Cause:** Hardcoded exchange rate in `lib/format.ts`.
- **Files Involved:**
  - `lib/format.ts`
- **Suggested Fix:** Create a simple key-value `public.platform_settings` database table, fetch exchange rates on platform load, and cache them in context.

### Bug 4: Lack of Rate Limiting on RFQ Submissions
- **Priority:** **MEDIUM**
- **Description:** The REST API endpoint `/api/rfqs` is open to public inserts without rate-limiting controls, leaving the database vulnerable to automated spam submissions.
- **Root Cause:** Missing route-level middleware gating or token bucket checks.
- **Files Involved:**
  - `app/api/rfqs/route.ts`
- **Database Tables Involved:** `public.rfqs`
- **Suggested Fix:** Introduce standard Next.js rate limiting middleware using Upstash Redis or a simple in-memory token bucket on `/api/rfqs`.

### Bug 5: Client-Side State Desynchronization on Account Switch
- **Priority:** **LOW**
- **Description:** Toggling company parameters or profile level details in context does not immediately re-evaluate the active session without a manual page reload.
- **Root Cause:** Next.js client context caches session metadata on load and lacks automated auth-token re-issuance hooks on metadata updates.
- **Files Involved:**
  - `app/account/page.tsx`
  - `lib/supabase/client.ts`
- **Suggested Fix:** Trigger a session refresh via `supabase.auth.refreshSession()` inside the update callback inside `AccountScreen`.
