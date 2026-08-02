# ALSOUK — COMPREHENSIVE API & INTEGRATIONS AUDIT

**Date:** August 2026
**Document:** Exhaustive Backend Routes and Integration Mapping
**Protocol:** REST API and PostgREST Service Handlers

---

## 1. Directory of API Endpoints

Every API handler located under `app/api/` has been systematically mapped and evaluated.

### 1.1 Category Hierarchy Endpoints
- **Endpoints:**
  - `GET /api/categories`
  - `GET /api/categories/[slug]`
- **Controller File:** `app/api/categories/route.ts` & `app/api/categories/[slug]/route.ts`
- **Purpose:** Fetches global catalog hierarchy trees.
- **Database Tables Used:** `public.categories`
- **Auth Level Required:** None.
- **Status:** **Works Correctly**.

### 1.2 Public/Private Companies Endpoints
- **Endpoints:**
  - `GET /api/companies`
  - `POST /api/companies`
  - `GET /api/companies/[slug]`
- **Controller File:** `app/api/companies/route.ts` & `app/api/companies/[slug]/route.ts`
- **Purpose:** Fetches listings, updates profiles, or creates new company storefronts.
- **Database Tables Used:** `public.companies`, `public.stores` (a default store is inserted via cascading triggers on company insert).
- **Auth Level Required:** Authenticated session required for `POST`.
- **Status:** **Works Correctly**.

### 1.3 Global RFQ Sourcing Endpoints
- **Endpoint:** `POST /api/rfqs`
- **Controller File:** `app/api/rfqs/route.ts`
- **Purpose:** Global quotation submissions connecting buyers to verified suppliers.
- **Database Tables Used:** `public.rfqs`, `public.companies`
- **Auth Level Required:** None (inserts are open to all visitors to promote zero friction sourcing).
- **Status:** **Works Correctly**.

### 1.4 Exhibition Applications Endpoints
- **Endpoints:**
  - `POST /api/exhibitions/applications`
  - `GET /api/exhibitions/applications/[id]`
- **Controller File:** `app/api/exhibitions/applications/route.ts` & `app/api/exhibitions/applications/[id]/route.ts`
- **Purpose:** Manages incoming vendor requests to exhibit inside tradeshows.
- **Database Tables Used:** `public.exhibition_applications`
- **Auth Level Required:** None for creations.
- **Status:** **Works Correctly**.

### 1.5 B2B Meeting Scheduling Endpoints
- **Endpoint:** `POST /api/exhibitions/visitor/meetings`
- **Controller File:** `app/api/exhibitions/visitor/meetings/route.ts`
- **Purpose:** Submits a scheduled consultation request.
- **Database Tables Used:** `public.exhibition_meetings`
- **Auth Level Required:** None (visitor-level local identification).
- **Status:** **Works Correctly**.

### 1.6 AI Sourcing Assistant Endpoints
- **Endpoint:** `POST /api/ai`
- **Controller File:** `app/api/ai/route.ts`
- **Purpose:** Generates OpenAI-compatible sourcing suggestions.
- **Auth Level Required:** Pluggable, disabled if no server-side API key exists.
- **Status:** **Works Correctly**.

---

## 2. Server-side Services Architecture (`lib/services/`)

ALSOUK separates database queries into a highly modular service tier:

### 2.1 SOUKI Live Feed: `posts-service.ts`
- **Responsibilities:** Manages feed operations. Handles creation, updating, unpublishing, publishing, and cursor-based feed pagination.
- **Integration Methods:** Joins `public.commercial_posts` and `public.companies` to fetch verified badges, slug strings, and branding logos in one REST query.

### 2.2 Tradeshow Hall Coordinator: `exhibitions-service.ts`
- **Responsibilities:** Contains all queries mapping exhibitions, active booth spaces, applicant registries, visitor notes, and meetings.
- **Resilience Strategy:** Employs defensive local fallback arrays (`globalThis.__mockExhibitions`, `globalThis.__mockBooths`, etc.) if Supabase REST configuration is unconfigured, preventing any crashes.

### 2.3 Notification Router: `notifications-service.ts`
- **Responsibilities:** Handles unread counters, specific read toggles, and notification triggers.
- **Integration Points:** Provides helpers (`notifyRFQ`, `notifyMessage`, `notifyFollower`) automatically posting updates to `public.notifications`.
