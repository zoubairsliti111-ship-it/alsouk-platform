# ALSOUK — ENGINEERING & DEVELOPMENT GUIDELINES (11_ENGINEERING_GUIDELINES)

**Author:** Lead Product Engineer & Principal Architect
**Status:** Approved Product Blueprint
**Target Audience:** All Software Engineers, Integrators, QA, and Code Reviewers
**Document Scope:** Code Quality, Folder Conventions, State Management, and Database transaction rules

---

## 1. Directory Structure & Organization Rules

The project directory is organized around a modular Next.js App Router structure. All code additions must follow these exact structural conventions:

*   **Page Routing (`app/`):** Group routes logically using route groups (e.g., `(auth)/` for login and registration). Keep routing folders lowercase.
*   **API Handlers (`app/api/`):** API routes must reside strictly under `app/api/`. Do not mix API files with page folders.
*   **Shared UI Primitives (`components/ui/`):** Place highly reusable, stateless UI elements (buttons, inputs, sliders) here.
*   **Domain Components (e.g., `components/marketplace/`):** Group business-logic components by domain (e.g., `rfq/`, `ai/`, `home/`).
*   **Modular Services (`lib/supabase/`):** Abstract all direct database operations into specialized service layers (e.g., `company-service.ts`, `rfq-service.ts`). **Do not write inline Supabase queries inside page layouts.**

---

## 2. Component Design & State Synchronization Rules

### 2.1 Server vs. Client Components
*   **Server Components (Default):** Use React Server Components (RSC) for data-fetching pages and static layouts to minimize client-side bundle sizes.
*   **Client Components (`"use client"`):** Reserve client-side rendering for highly interactive forms, modals, tabs, and real-time feeds.

### 2.2 Preventing Cascading Render Cycles (The Search State Rule)
To prevent React cascading render warnings and comply with ESLint rules (such as `react-hooks/set-state-in-effect`):
*   **Rule:** **Do not trigger `setState` inside a `useEffect` hook to synchronize search query parameters.**
*   **Anti-Pattern:**
    ```tsx
    // BAD: Triggers multiple re-render loops and layout lag
    useEffect(() => {
      setSearchQuery(searchParams.get('q'));
    }, [searchParams]);
    ```
*   **Standard Pattern:** **Derive values directly during render.**
    ```tsx
    // GOOD: Single pass render execution
    const activeQuery = searchParams.get('q') || '';
    ```

---

## 3. Database & Transaction Guidelines

### 3.1 Idempotent Migrations
All Supabase database migrations must be designed defensively to prevent schema drift and handle existing tables gracefully:
*   Enforce column creation safety using `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`.
*   Always define referenced tables (such as legacy pointers) sequentially in the migration files before their foreign keys are declared.

### 3.2 Transaction Integrity (Orphan Safeguard)
*   When executing compound database inserts (such as company onboarding, which writes to `companies`, `company_members`, and `stores` simultaneously), **all queries must run within a single transaction pipeline**.
*   **Implementation:** If the primary company insert succeeds but the member join-table write fails, the entire operation must rollback to prevent orphaned, ownerless database records.

---

## 4. Performance & Mobile-First Optimization

Our target users operate on slower, unpredictable mobile networks. Implement these performance safeguards:

1.  **Image Optimization:** Never render unoptimized raw external URLs directly on catalog cards. Always use the Next.js `<Image />` component with configured WebP formats and sizes.
2.  **Lazy Loading Below-the-Fold Rails:** Do not fetch data for below-the-fold carousel rails (such as "Live Marketplace" or "Featured Products") during initial page load. Use dynamic, deferred imports or lazy-loading boundaries.
3.  **Client-Side Bundle Budgets:** Avoid importing heavy third-party libraries (such as massive chart libraries or utility suites). Rely on native CSS animations and Tailwind CSS v4 primitives.

---

## 5. Security & Row-Level Security (RLS)

*   **Enforcement:** RLS must be enabled on **100% of the public database tables**.
*   **Verification:** Any select/insert/update/delete operations on tables containing user PII (such as buyer phone numbers in the `rfqs` table) must require explicit permission checks.
*   **Endpoint Safeguards:** Secure admin route folders (`/admin/rfqs`) using both client-side middleware redirects and server-side session checks before data resolution.

---

## 6. Testing & Review Rules

*   **Code Quality Checks:** Run standard linting (`npm run lint` or `pnpm run lint`) and production builds (`npm run build`) before staging code.
*   **Linter Compliance:** Never bypass linter errors using generic `any` types or `@ts-ignore` exceptions unless explicitly authorized in this specification.
*   **Review Integrity:** No PR may be merged without verifying that layout components render correctly on both **LTR and RTL orientations** using Tailwind's logical properties.
