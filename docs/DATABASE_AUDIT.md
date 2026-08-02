# ALSOUK — MASTER DATABASE SPECIFICATION

**Date:** August 2026
**Document:** Complete Database Documentation and Audit
**Database:** Supabase PostgreSQL Schema

---

## 1. Migration Log

The ALSOUK database schema is constructed sequentially via 18 database migrations located in the `supabase/migrations/` directory:

| Version | Migration File Name | Target Actions | Status |
| :---: | :--- | :--- | :---: |
| **0000** | `0000_create_suppliers.sql` | Creates legacy `suppliers` directory table | Applied |
| **0001** | `0001_create_rfqs.sql` | Creates global `rfqs` table, sets up RLS | Applied |
| **0002** | `0002_create_marketplace.sql`| Core catalog: `companies`, `stores`, `categories`, `company_categories`, `products`, `product_images`, `product_categories` | Applied |
| **0003** | `0003_fix_companies_owner_id.sql`| Integrates `owner_id uuid REFERENCES auth.users(id)` and adds unique index | Applied |
| **0004** | `0004_update_companies_schema.sql`| Expands `companies` with website mode, rating, business types, supported languages, export markets, creates `company_members` and `company_media` | Applied |
| **0005** | `0005_add_company_id_to_business_objects.sql`| Adds `company_id` to `rfqs` and `products` | Applied |
| **0006** | `0006_create_commercial_posts.sql`| Initial design of `commercial_posts` table and storage buckets | Applied |
| **0007** | `0007_create_notifications.sql`| Creates `notifications` schema and read triggers | Applied |
| **0008** | `0008_create_exhibitions.sql`| Virtual tradeshows schema: `exhibitions`, `exhibition_booths`, `exhibition_items`, `exhibition_media`, `exhibition_documents` | Applied |
| **0009** | `0009_create_exhibition_applications.sql`| Creates `exhibition_applications` and cascade triggers | Applied |
| **0010** | `0010_extend_exhibition_booths_for_dashboard.sql`| Adds status enums, draft configurations, and review notes | Applied |
| **0011** | `0011_add_logo_url_to_exhibition_booths.sql`| Adds `logo_url` overrides on `exhibition_booths` | Applied |
| **0012** | `0012_add_short_description_to_exhibition_items.sql`| Adds `short_description` column on `exhibition_items` | Applied |
| **0013** | `0013_add_cover_fields_to_exhibition_media.sql`| Adds cover image flags on `exhibition_media` | Applied |
| **0014** | `0014_create_exhibition_admin_policies.sql`| Enables UPDATE/INSERT RLS policies for booths & applications | Applied |
| **0015** | `0015_social_commerce.sql`| Sets up social activity: likes, comments, follows, live sessions | Applied |
| **0016** | `0016_add_profile_level_to_companies.sql`| Adds plan-specific `profile_level` enum on `companies` | Applied |
| **0017** | `0017_commercial_posts_and_dependencies.sql`| Cleanses/drops previous post tables and establishes unified `commercial_posts`, `commercial_post_media`, `commercial_post_likes`, `commercial_post_comments`, `commercial_post_bookmarks`, `commercial_post_views` | Applied |

---

## 2. Table Specifications

### 2.1 Table: `public.companies`
- **Purpose:** Central entity representing a verified business profile in ALSOUK.
- **Columns:**
  - `id` `uuid` (Primary Key, Default: `gen_random_uuid()`)
  - `owner_id` `uuid` (References `auth.users(id) ON DELETE SET NULL`)
  - `name` `text` (Not Null)
  - `slug` `text` (Unique, Not Null)
  - `logo_url` `text` (Branded logo image URL)
  - `banner_url` `text` (Hero cover image URL)
  - `description` `text` (Business bio details)
  - `tagline` `text` (Short branding tagline)
  - `city` `text` (Operating headquarters city)
  - `business_type` `text` (e.g., 'Manufacturer', 'Exporter', 'Wholesaler')
  - `primary_industry` `text` (e.g., 'Food & Agriculture', 'Textiles')
  - `whatsapp_number` `text` (Direct SOUKI contact number)
  - `facebook_url` `text`
  - `tiktok_url` `text`
  - `website_url` `text`
  - `website_mode` `text` (e.g., 'catalog', 'e-commerce')
  - `profile_level` `text` (Default: `'starter'`, plan level of the company)
  - `tax_identifier` `text` (Matricule Fiscal / National Registry)
  - `supported_languages` `text[]` (Array of operating languages)
  - `export_markets` `text[]` (Array of active trade corridors)
  - `created_at` `timestamp with time zone`
  - `updated_at` `timestamp with time zone`
- **Indexes:**
  - `companies_pkey` on `id`
  - `companies_slug_key` on `slug`
  - `companies_owner_id_idx` on `owner_id`

### 2.2 Table: `public.stores`
- **Purpose:** Active storefront config tied directly to a company profile.
- **Columns:**
  - `id` `uuid` (Primary Key, Default: `gen_random_uuid()`)
  - `company_id` `uuid` (References `public.companies(id) ON DELETE CASCADE`)
  - `slug` `text` (Unique, Not Null)
  - `theme` `jsonb` (Visual settings)
- **Indexes:**
  - `stores_pkey` on `id`
  - `stores_slug_key` on `slug`

### 2.3 Table: `public.products`
- **Purpose:** Public marketplace product listings.
- **Columns:**
  - `id` `uuid` (Primary Key, Default: `gen_random_uuid()`)
  - `company_id` `uuid` (References `public.companies(id) ON DELETE CASCADE`)
  - `name` `text` (Not Null)
  - `description` `text`
  - `price` `numeric` (USD price index)
  - `moq` `numeric` (Minimum Order Quantity)
  - `created_at` `timestamp with time zone`
  - `updated_at` `timestamp with time zone`
- **Indexes:**
  - `products_pkey` on `id`
  - `products_company_id_idx` on `company_id`

### 2.4 Table: `public.company_members`
- **Purpose:** Many-to-many join table separating company ownership and user members.
- **Columns:**
  - `id` `uuid` (Primary Key, Default: `gen_random_uuid()`)
  - `company_id` `uuid` (References `public.companies(id) ON DELETE CASCADE`)
  - `user_id` `uuid` (References `auth.users(id) ON DELETE CASCADE`)
  - `role` `text` (Default: `'member'`, supports `'admin'`)
- **Indexes:**
  - `company_members_pkey` on `id`
  - `company_members_unique` on `(company_id, user_id)`

### 2.5 Table: `public.exhibition_booths`
- **Purpose:** Branded virtual tradeshow spaces.
- **Columns:**
  - `id` `uuid` (Primary Key, Default: `gen_random_uuid()`)
  - `exhibition_id` `uuid` (References `public.exhibitions(id) ON DELETE CASCADE`)
  - `company_id` `uuid` (References `public.companies(id) ON DELETE CASCADE`)
  - `booth_number` `text` (Assigned pavilion location)
  - `status` `text` (Default: `'Draft'`, supports `'Submitted'`, `'Approved'`, `'Rejected'`)
  - `logo_url` `text` (Booth branding logo override)
  - `is_featured` `boolean` (Default: `false`)
- **Indexes:**
  - `exhibition_booths_pkey` on `id`
  - `exhibition_booths_exhibition_idx` on `exhibition_id`
  - `exhibition_booths_company_idx` on `company_id`

### 2.6 Table: `public.commercial_posts`
- **Purpose:** Social-commerce updates published on public/Instagram-style feeds.
- **Columns:**
  - `id` `uuid` (Primary Key, Default: `gen_random_uuid()`)
  - `company_id` `uuid` (References `public.companies(id) ON DELETE CASCADE`)
  - `author_id` `uuid` (References `auth.users(id) ON DELETE SET NULL`)
  - `content` `text` (Caption updates)
  - `images` `text[]` (Post images array)
  - `status` `text` (Default: `'published'`, supports `'draft'`)
  - `view_count` `integer` (Default: `0`)
  - `created_at` `timestamp with time zone`
- **Indexes:**
  - `commercial_posts_pkey` on `id`
  - `commercial_posts_company_idx` on `company_id`

---

## 3. Database Triggers & Functions

### 3.1 Function: `public.is_company_member(company_id uuid)`
- **Purpose:** Verification check for owner RLS routing. Checks if the active authenticated session (`auth.uid()`) belongs to `company_members` for the targeted company.
- **Implementation:**
  ```sql
  CREATE OR REPLACE FUNCTION public.is_company_member(comp_id uuid)
  RETURNS boolean AS $$
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = comp_id AND user_id = auth.uid()
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```

### 3.2 Trigger: `on_application_approved`
- **Purpose:** Triggers automatic provisioning of an empty virtual booth in `'Draft'` status inside `public.exhibition_booths` immediately upon tradeshow application status transition to `'Approved'`.
- **Target Table:** `public.exhibition_applications`

---

## 4. Row-Level Security (RLS) Policy Specifications

Strict public-read and authenticated-write configurations protect all marketplace entities.

### 4.1 Table: `public.companies`
- **Public Select:** `CREATE POLICY "Public Read" ON public.companies FOR SELECT USING (true);`
- **Member Update:** `CREATE POLICY "Members Update" ON public.companies FOR UPDATE USING (public.is_company_member(id));`
- **Authenticated Insert:** `CREATE POLICY "Auth Insert" ON public.companies FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);`

### 4.2 Table: `public.products`
- **Public Select:** `CREATE POLICY "Products Public Read" ON public.products FOR SELECT USING (true);`
- **Owner Modifications:** `CREATE POLICY "Owner Edit Products" ON public.products FOR ALL USING (public.is_company_member(company_id));`

### 4.3 Table: `public.exhibition_applications`
- **Public Submissions:** `CREATE POLICY "Public Application Insert" ON public.exhibition_applications FOR INSERT WITH CHECK (true);`
- **Recipient/Sender Select:** `CREATE POLICY "Public Application Select" ON public.exhibition_applications FOR SELECT USING (true);`
