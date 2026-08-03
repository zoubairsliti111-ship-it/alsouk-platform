# ALSOUK — BUGS & FUNCTIONAL AUDIT ISSUES

This document catalogs detected functional bugs, architectural issues, and validation concerns across the ALSOUK B2B Platform.

---

## 1. Critical & Major Issues

### 1.1 Missing Chat Message Persistence Table
* **Description:** The chat interface at `/messages` is fully modeled visually but has no backing `public.messages` or `public.conversations` table inside `supabase/schema.sql` or migrations.
* **Impact:** Chat communications sent between buyers and suppliers are not stored, causing conversations to clear on page reloads.
* **Status:** ❌ Missing table in DB.

### 1.2 No SMS OTP Gateway Integration for Phone Profiles
* **Description:** The platform supports phone-number credentials by converting them to synthetic emails (`phoneXXXXXXXX@alsouk.com`), but lacks a regional SMS gateway connection.
* **Impact:** Users who register with phone numbers cannot recover forgotten passwords, as email password recovery links will go to non-existent synthetic inboxes.
* **Status:** 🟡 Partial implementation.

### 1.3 Missing Database Rate-Limiting on Public Guest Endpoints
* **Description:** Endpoints such as `/api/rfqs` and `/api/exhibitions/meetings` allow public (`anon`) inserts to enable easy buyer access, but lack server-side rate-limiting.
* **Impact:** High vulnerability to spam insertions if bot scripts repeatedly hit the REST API.
* **Status:** ❌ Missing rate limits.

---

## 2. Minor Issues & UI Quirks

### 2.1 Hardcoded USD-to-TND Currency Exchange Rate
* **Description:** The currency utility `lib/format.ts` converts USD catalog prices to Tunisian Dinar (TND) using a hardcoded static conversion rate (`3.1`).
* **Impact:** Currency valuations will drift over time as market exchange rates fluctuate.
* **Status:** 🟡 Hardcoded.

### 2.2 Dual Post Table Structure (Orphaned Table Risks)
* **Description:** The coexistence of legacy `public.posts` and modern `public.commercial_posts` might cause developer confusion.
* **Impact:** Risk of writing data to the incorrect posts table, breaking public feeds.
* **Status:** 🟡 Redundant schema.
