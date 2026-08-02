# ALSOUK — DATABASE & SCHEMA REVIEW SPECIFICATION

**Author:** Lead Product Engineer & Product Architect
**Status:** Complete
**Date:** July 2026

---

## 1. Database Overview

ALSOUK's database layer is hosted in Supabase, leveraging PostgreSQL. The database layout is structured as a relational marketplace. By moving from legacy user-owned single supplier columns to a specialized membership schema, ALSOUK natively supports complex B2B scenarios where multiple colleagues/managers can edit and publish catalogs for a single company.

---

## 2. Definitive Schema & Table Audits

Below is a thorough architectural analysis of every table, including foreign keys, nullability, indices, and RLS policies:

### 2.1 Table: `public.companies`
Stores core B2B merchant organizational profiles.

- **Primary Key:** `id` (UUID, default: `gen_random_uuid()`)
- **Foreign Keys:**
  - `supplier_id` references `public.suppliers(id)` on delete set null (Legacy migration pointer)
  - `owner_id` references `auth.users(id)` on delete set null (Legacy backward compatibility pointer)
- **Nullable Fields:** `description`, `logo_url`, `banner_url`, `facebook_url`, `instagram_url`, `tiktok_url`, `linkedin_url`, `youtube_url`, `website_url`, `business_email`, `phone_number`, `whatsapp_number`, `city`, `postal_code`, `street_address`, `business_type`, `primary_industry`, `year_established`, `company_size`, `tax_identifier`, `verified_at`, `license_document_url`
- **Indices:**
  - `companies_owner_id_idx` on `owner_id` (B-tree)
  - `companies_supplier_id_idx` on `supplier_id` (B-tree)
  - `companies_verified_idx` on `verified` (B-tree)
  - `companies_website_mode_idx` on `website_mode` (B-tree)
  - `companies_verification_tier_idx` on `verification_tier` (B-tree)
  - `companies_supported_languages_idx` on `supported_languages` (GIN)
  - `companies_export_markets_idx` on `export_markets` (GIN)
- **RLS Policies:**
  - **SELECT:** Publicly readable (Using: `true`)
  - **INSERT:** Authenticated users only (With check: `auth.uid() is not null`)
  - **UPDATE:** Limited to owners and admins inside the `company_members` join table
  - **DELETE:** Restricted solely to the role of `'owner'` inside the `company_members` table
- **Triggers:** `companies_set_updated_at` before update triggers the custom `set_updated_at()` procedure.

---

### 2.2 Table: `public.company_members`
A join-table that decouples users from company profiles, supporting multi-member collaborative merchant organizations.

- **Primary Key:** `id` (UUID, default: `gen_random_uuid()`)
- **Foreign Keys:**
  - `company_id` references `public.companies(id)` on delete cascade
  - `user_id` references `auth.users(id)` on delete cascade
- **Nullable Fields:** None
- **Constraints:** Unique on `(company_id, user_id)`
- **Indices:**
  - `company_members_user_id_idx` on `user_id`
  - `company_members_company_id_idx` on `company_id`
- **RLS Policies:**
  - **SELECT:** Publicly readable
  - **INSERT:** Users can insert their initial membership when establishing a company (`user_id = auth.uid()`)
  - **ALL (Admin/Owner updates):** Restricted to company owners/admins

---

### 2.3 Table: `public.stores`
Storefront configuration fields for companies. A company can have multiple virtual storefront outlets.

- **Primary Key:** `id` (UUID, default: `gen_random_uuid()`)
- **Foreign Keys:**
  - `company_id` references `public.companies(id)` on delete cascade
- **Nullable Fields:** `tagline`, `description`, `logo_url`, `banner_url`, `logo_storage_path`, `banner_storage_path`
- **Indices:**
  - `stores_company_id_idx` on `company_id`
  - `stores_is_active_idx` on `is_active`
- **RLS Policies:**
  - **SELECT:** Publicly readable if `is_active` is true, or if current auth user is company owner/admin
  - **INSERT/UPDATE/DELETE:** Checked against company membership permissions

---

### 2.4 Table: `public.products`
Houses B2B items sold by companies. Denormalizes `company_id` for simpler queries.

- **Primary Key:** `id` (UUID, default: `gen_random_uuid()`)
- **Foreign Keys:**
  - `store_id` references `public.stores(id)` on delete cascade
  - `company_id` references `public.companies(id)` on delete cascade
- **Nullable Fields:** `sku`, `description`, `price`, `stock_quantity`, `unit`
- **Constraints:** Unique on `(store_id, slug)`
- **Indices:**
  - `products_store_id_idx` on `store_id`
  - `products_company_id_idx` on `company_id`
  - `products_is_active_idx` on `is_active`
  - `products_created_at_idx` on `created_at desc`
- **RLS Policies:**
  - **SELECT:** Public read access for active products
  - **INSERT/UPDATE/DELETE:** Restricted to company owners/admins

---

### 2.5 Table: `public.product_images`
Saves product catalog gallery images. Uses position-based rendering.

- **Primary Key:** `id` (UUID, default: `gen_random_uuid()`)
- **Foreign Keys:**
  - `product_id` references `public.products(id)` on delete cascade
- **Nullable Fields:** `url` (caches resolved public URL), `alt`
- **Constraints:** Partial unique index `product_images_one_primary_idx` ensures only one image can be primary per product.
- **RLS Policies:**
  - **SELECT:** Public read access
  - **ALL:** Limited to product/company owners

---

### 2.6 Table: `public.categories`
Hierarchical product taxonomy dictionary, managed by platform administrators.

- **Primary Key:** `id` (UUID, default: `gen_random_uuid()`)
- **Foreign Keys:**
  - `parent_id` self-references `public.categories(id)` on delete set null
- **Nullable Fields:** `description`
- **RLS Policies:** Public read-only. Writes are restricted to service role tokens.

---

### 2.7 Table: `public.company_media`
Houses merchant-submitted verification documents, factory photos, and certificates.

- **Primary Key:** `id` (UUID, default: `gen_random_uuid()`)
- **Foreign Keys:**
  - `company_id` references `public.companies(id)` on delete cascade
- **Nullable Fields:** `caption`
- **RLS Policies:** Public read-only; manage operations limited to company owners/admins.

---

### 2.8 Table: `public.rfqs`
RFQs (Requests for Quote) submitted by regional buyers. Linked to targeted companies and legacy suppliers.

- **Primary Key:** `id` (UUID, default: `gen_random_uuid()`)
- **Foreign Keys:**
  - `supplier_id` references `public.suppliers(id)` on delete set null
  - `company_id` references `public.companies(id)` on delete set null
- **Nullable Fields:** `supplier_id`, `company_id`, `supplier_name`, `target_price`
- **RLS Policies:**
  - **INSERT:** Publicly accessible (Allows any guest/anon buyer to submit quotes)
  - **SELECT/UPDATE/DELETE:** Strictly locked. No public read policy is defined to protect buyer contact PII. Only accessible via service-role clients.

---

### 2.9 Table: `public.suppliers`
Legacy, read-only directory tracking Tunisian suppliers. Used as a migration source for modern marketplace profiles.

- **Primary Key:** `id` (UUID, default: `gen_random_uuid()`)
- **Nullable Fields:** `user_id`, `description`, `logo_url`
- **RLS Policies:** Public read-only; no write access.

---

## 3. Database Security, Encryption & Storage Strategy

- **SSL & Transit Encryption:** Enforced globally. Database connections require SSL.
- **Row Level Security (RLS):** Enabled on 100% of the public tables, shielding catalog and contact information.
- **Storage Buckets:** Standardized on `product-images` and `company-media` buckets in Supabase Storage.
- **Scalability Considerations:** Uses UUID v4 primary keys to prevent ID enumeration. Database constraints and composite indices prevent duplicate active slugs and orphaned memberships.
