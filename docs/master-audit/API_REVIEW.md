# ALSOUK — API LAYER AND DATA HANDLING SPECIFICATION

**Author:** Lead Product Engineer & Product Architect
**Status:** Complete
**Date:** July 2026

---

## 1. API Architecture Overview

ALSOUK handles data fetching using Next.js route handlers alongside direct server-side PostgREST fetches via Supabase. These direct fetches are abstracted within service layers like `company-service.ts` and `rfq-service.ts` to keep database calls clean and organized.

```
                              +-------------------------+
                              |    React UI Page        |
                              +------------+------------+
                                           |
                                           v
                              +-------------------------+
                              |      Service Layer      |
                              | (e.g. company-service)  |
                              +------------+------------+
                                           |
                              +------------+------------+
                              |  Supabase Server Client |
                              +------------+------------+
                                           |
                                           v
                              +-------------------------+
                              |      Supabase API       |
                              +-------------------------+
```

---

## 2. API Security, Caching & Validation Audit

### 2.1 Supabase Client Orchestration
- **Implementation:** The client utilizes browser-side fetches via `createBrowserClient` in `lib/supabase/client.ts` and server-side operations via `createServerClient` in `lib/supabase/server.ts`.
- **Defensive Design:** Both client builders return mock fallback structures if environment keys are missing, preventing fatal compilation crashes during production builds.

### 2.2 Server Actions vs. Route Handlers
- **Implementation:** ALSOUK utilizes Next.js Route Handlers (`app/api/*/route.ts`) to handle public REST submissions, such as submitting RFQs and AI queries.
- **Audit Findings:** The route handlers are lightweight and handle CORS appropriately. However, they perform basic object validation on inputs, which could be improved with standard validation libraries like `Zod`.

### 2.3 Error Handling and UI Loading States
- **Forms:** Forms implement client-side validation, error banners, and disable submit buttons to prevent double-submissions.
- **Loading Indicators:** The UI displays `Loader2` spinner states during asynchronous fetches (e.g. role selection, profile updates), ensuring a responsive user experience.

### 2.4 Data Fetching & Caching
- **Implementation:** The codebase performs real-time queries for personal dashboards, while utilizing Next.js's native fetch cache for static catalogs.
- **Optimization Opportunities:** Standardizing the revalidation parameters (`next: { revalidate: 3600 }`) on product listings would optimize data fetching speeds across regional, low-bandwidth connections.
