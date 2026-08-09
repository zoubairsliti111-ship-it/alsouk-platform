# ALSOUK — DATABASE ARCHITECTURE AUDIT

This document establishes the definitive database architecture audit of the ALSOUK PostgreSQL schema managed via Supabase.

---

## 1. Schema Inventory (Tables & Core Purpose)

The database schema spans 30 tables supporting marketplace catalogs, company structures, notifications, social commerce, and trade show exhibitions:

1. **`public.suppliers`:** Legacy directory table backing the flat buyer/seller listings.
2. **`public.companies`:** Modern single source of truth for B2B company structures.
3. **`public.company_members`:** Multi-owner membership permissions framework (Owner, Admin, Editor) mapping `auth.users` to companies.
4. **`public.company_media`:** Corporate certification assets and galleries.
5. **`public.company_follows`:** Social following links between buyers and companies.
6. **`public.stores`:** Custom digital storefronts representing verified companies.
7. **`public.categories`:** Central taxonomy tree (parent-child hierarchy) representing trade sectors.
8. **`public.company_categories`:** Link table binding companies to operational business branches.
9. **`public.products`:** Standard catalog listing details.
10. **`public.product_images`:** Multi-photo assets associated with catalog products.
11. **`public.product_categories`:** Mapping taxonomy linking individual products to categories.
12. **`public.rfqs`:** Central Request for Quotes and buyer bidding lead board.
13. **`public.notifications`:** Multi-channel notification center.
14. **`public.exhibitions`:** Virtual trade show event configurations.
15. **`public.exhibition_applications`:** Onboarding sign-up requests submitted by companies.
16. **`public.exhibition_booths`:** Immersive virtual booths provisioned on tradeshow approval.
17. **`public.exhibition_items`:** Dedicated virtual exhibit prototypes or services.
18. **`public.exhibition_media`:** Cover and gallery assets loaded in booth spaces.
19. **`public.exhibition_documents`:** PDF catalog guides and brochures.
20. **`public.live_sessions`:** Streaming commercial slots (live / upcoming / ended).

### 1.1 Duplication and Overlap Diagnostics
* **Legacy Table Duplicate:** `public.suppliers` vs `public.companies`. While `public.suppliers` represents the legacy flat catalog record, `public.companies` is the modern relational container that supports progressive tiers (`profile_level`) and multi-member ownerships (`company_members`).
* **Post Engine Duplicate:** `public.posts` (from `0015_social_commerce.sql`) vs `public.commercial_posts` (redefined in `0017_commercial_posts_and_dependencies.sql`). Modern feed elements interact with `commercial_posts` and its helper tables, leaving `posts` as a legacy artifact.

---

## 2. Foreign Key Relationships & Cascades

Referential integrity is strictly maintained across tables to prevent orphan rows:
* **`public.stores`** references `public.companies(id) on delete cascade`.
* **`public.products`** references `public.companies(id) on delete cascade`.
* **`public.product_images`** references `public.products(id) on delete cascade`.
* **`public.company_members`** references `public.companies(id) on delete cascade` and `auth.users(id) on delete cascade`.
* **`public.exhibition_booths`** references `public.exhibitions(id) on delete cascade` and `public.companies(id) on delete cascade`.
* **`public.exhibition_items`** references `public.exhibition_booths(id) on delete cascade`.

---

## 3. Indexes & Performance Optimization

High-traffic fields are fully indexed to support snappy lookups on complex joins:
* **`suppliers`:** `suppliers_country_idx`, `suppliers_category_idx`, `suppliers_verified_idx`.
* **`companies`:** `companies_slug_idx`, `companies_owner_id_idx`.
* **`products`:** `products_company_id_idx`, `products_category_id_idx`.
* **`rfqs`:** `rfqs_supplier_id_idx`, `rfqs_created_at_idx`.
* **`notifications`:** Index on `recipient_id`, `is_read`, `created_at desc`.
* **`exhibition_booths`:** Index on `exhibition_id`, `company_id`.

---

## 4. Trigger & Automation Helpers

PostgreSQL triggers automate schema workflows on data updates:
1. **`set_updated_at` Trigger:** Executed on almost all tables to sync the current timestamp to the `updated_at` column.
2. **`companies_enroll_owner` Trigger:** Automatically inserts the company's creator as the initial `"owner"` into the `company_members` table on company creation.
3. **`post_likes_count` and `post_comments_count` Triggers:** Automatically increment counters on posts whenever a likes or comments row is written.

---

## 5. Row-Level Security (RLS) Policies

All 30 tables enforce Row-Level Security, allowing public read-only access while gating mutations behind user sessions:
* **`public.suppliers` / `public.companies`:** Select is allowed for anyone (`anon`); insert/update is permitted only to authenticated owners or members.
* **`public.rfqs`:** Insert is publicly allowed (`anon`) to let buyer guests easily request quotes; reading is restricted to administrative dashboard scopes.
* **`public.notifications`:** Recipient-only SELECT, UPDATE, and DELETE policies to prevent users from modifying other people's notifications.
* **`public.exhibition_booths`:** Enable public SELECT, with UPDATE actions gated behind administrative and owner permissions.

---

## 6. Storage Buckets

* **`commercial-posts`:** Holds images, PDFs, and video clip uploads for commercial feeds. Includes strict RLS policies:
  - SELECT: Allowed for anyone.
  - INSERT / DELETE: Gated for authenticated company members.
