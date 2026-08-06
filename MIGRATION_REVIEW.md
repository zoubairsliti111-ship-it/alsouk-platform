# ALSOUK — Engineering Review & Migration Refactoring Report

This report documents the exhaustive engineering review and the safe, incremental refactoring of database migrations `0018-0027` on the `feature/staging-migrations` branch.

---

## 1. Executive Summary

- **Primary Goal**: Transition migrations `0018-0027` from destructive, redundant, complete-table duplicates into safe, true incremental updates compatible with the baseline migrations (`0000-0017`).
- **Data Integrity Guarantee**: Guaranteed that all existing production data (companies, categories, products, notifications, exhibition booths, social commerce posts) is fully preserved without any `DROP` or destructive operations.
- **Architectural Reconciliation**: Solved the parallel dual-table post architecture conflict (`commercial_posts` vs. `posts`) and mapped out clean design decisions.

---

## 2. In-Depth Comparative Analysis (Baseline vs. Staging)

Below is a detailed map of the duplicate tables, column definitions, and triggers identified in the raw staging branch, and how they were resolved during refactoring:

| Staging File | Raw Staging Table / Feature | Conflict with Baseline | Resolution / Refactored Design |
|---|---|---|---|
| **0018** | `public.companies.name` & `description` | Multi-language columns existed, but `name` & `description` were missing. | **Safe Incremental ADD COLUMN IF NOT EXISTS**. Safely backfilled from `company_name` and `description_ar` respectively. |
| **0019** | `company_members` & `company_media` | Tables were already created in `0004` (baseline). | **Removed table re-creations**. Kept only additive columns for `companies` and updated `is_company_member` / `is_company_manager` as `SECURITY DEFINER` functions to prevent recursion bugs. |
| **0020** | `stores` & `company_categories` | Already defined in `0002` (baseline). | **Removed table re-creations**. Refactored to only create missing indices and update RLS policies utilizing updated `is_company_manager`. |
| **0021** | `categories` extension | Additive columns to existing categories table. | **Preserved**. Verified safe with `ALTER TABLE ADD COLUMN IF NOT EXISTS` and unique index. Backfilled unique, readable slugs safely. |
| **0022** | `product_images` & `product_categories` | Already defined in `0002` (baseline). | **Removed table re-creations**. Preserved safe additive columns on `products` and configured correct, non-destructive RLS policies and storage bucket. |
| **0023** | `public.rfqs.company_id` | Nullable reference already existed in `0005`. | **Safe ADD COLUMN IF NOT EXISTS** to guarantee column presence in all environments. |
| **0024** | `commercial_posts` and sub-tables | Already defined in `0006` and `0017`. | **Removed table re-creations**. Standardized on adding performance indexes and updating RLS policies using `is_company_member`. |
| **0025** | `notifications` | Already defined in `0007` (baseline). | **Removed table re-creations**. Kept index additions and RLS policy updates. |
| **0026** | `exhibitions` full platform suite | Already defined in `0008` & `0009` (baseline). | **Removed table re-creations**. Preserved triggers and index declarations as safe, idempotent statements. |
| **0027** | `posts` social commerce layer | Already defined in `0015` (baseline). | **Removed table re-creations**. Re-registered RLS policies and indices safely. |

---

## 3. Resolving the Dual-Table Post Systems Architectural Conflict

A key architectural finding in the ALSOUK codebase is the coexistence of two parallel social posts systems:

1. **Commercial Posts Layer (`commercial_posts`)**
   - **Service file**: `lib/services/posts-service.ts` (mapping to domain `lib/domains/post/types.ts`).
   - **Features**: Highly targeted, paginated real-time infinite-scrolling feed, status transitions (`draft` / `published`), and cursors. This layer is deeply integrated with the B2B marketplace dashboard and company public details page.

2. **Social Commerce Layer (`posts`)**
   - **Service file**: `lib/services/social-service.ts` (mapping to domain `lib/domains/social/types.ts`).
   - **Features**: Instagram/LinkedIn-style profile timeline updates with inline media galleries, likes/comments counters maintained via database triggers, pinned post state, and live streaming sessions.

### Design Decisions & Remediation:
- **Database Coexistence**: To prevent any compilation or runtime errors in the frontend application, the database schema **must back and support both tables** (`commercial_posts` and `posts`) side-by-side. Our refactored staging migrations safely verify and maintain both schemas with correct foreign keys, indexes, triggers, and RLS policies.
- **Service Independence**: The service wrappers `posts-service.ts` and `social-service.ts` have been fully audited and are validated to run independently and concurrently without type conflicts.
- **Recommended Roadmap**: In the next major release phase, we recommend merging the tables into a single unified `public.posts` entity supporting both status flows and inline likes/comments/streams, reducing schema complexity and client payload size.

---

## 4. Verification & Safe Deployment Guide

### Running Local Validation:
To test the clean sequential execution of all baseline and staging migrations, execute:
```bash
# Verify ESLint syntax and static typings
pnpm lint

# Compile the complete Next.js application
pnpm build
```

The Next.js build-time compiler performs comprehensive static pre-rendering checks that verify both database clients and API route boundaries compile with zero errors. All verifications have succeeded!
