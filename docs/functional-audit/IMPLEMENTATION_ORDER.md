# ALSOUK — REMEDIATION ROADMAP
## STEP-BY-STEP IMPLEMENTATION ROADMAP

This document outlines the structured development phases to remediate technical debt, resolve architectural gaps, and progressively expand features while preserving strict alignment with the SOUKI B2B product philosophy.

---

## Phase 1: Security, Stability & DB Cleanups (Immediate Priority)

### Step 1.1: Resolve Dual-Schema Duplications
* **Action:**
  1. Migrate all old records from the `public.suppliers` table into the modern relational `public.companies` model.
  2. Deprecate and drop `public.suppliers` and the duplicate `public.posts` tables.
  3. Clean up legacy service helper wrappers such as `lib/supabase/suppliers-service.ts`.

### Step 1.2: Add Rate Limiting on Guest Endpoints
* **Action:**
  1. Introduce Next.js middleware-level rate-limiting on endpoints `/api/rfqs` and `/api/exhibitions/meetings`.
  2. Protect public Postgres tables with tighter connection pools or captcha checks.

---

## Phase 2: Core Messaging & Regional Authentications (Short-Term)

### Step 2.1: Implement Message Persistence Table
* **Action:**
  1. Write a database migration establishing `public.conversations` and `public.messages` tables.
  2. Refactor `/messages` api route to pull and push message datasets directly from these tables.
  3. Connect realtime WebSocket subscriptions to enable instantaneous notification alerts.

### Step 2.2: SMS OTP Gateway Setup
* **Action:**
  1. Connect a regional North African telecom gateway or a Twilio carrier endpoint.
  2. Support true phone OTP logins to deprecate synthetic email conversions.

---

## Phase 3: Globalizations & Dynamic Pricing (Medium-Term)

### Step 3.1: JSONB Multilingual Dynamic Catalogs
* **Action:**
  1. Convert columns like `product.name` and `product.description` to PostgreSQL `jsonb` fields.
  2. Enable suppliers to register descriptions in Arabic, French, and English simultaneously.

### Step 3.2: Dynamic Currency Settings Table
* **Action:**
  1. Replace hardcoded static multipliers with dynamic settings pulled from a currency config table.
  2. Introduce scheduled cron tasks on the backend to automatically update exchange rates.
