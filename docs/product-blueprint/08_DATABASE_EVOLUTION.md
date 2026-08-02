# ALSOUK — DATABASE EVOLUTION SPECIFICATION (08_DATABASE_EVOLUTION)

**Author:** Chief Product Officer & Lead Database Architect
**Status:** Approved Product Blueprint
**Target Audience:** Database Administrators, Backend Engineers, DevOps Leads
**Document Scope:** Schema Evolution, Migration Strategies, RLS Policies, Indexes, and Scalability

---

## 1. Current Schema Baseline

The current database is hosted on Supabase (PostgreSQL) and comprises the following tables:
*   `public.companies` — Modern B2B organizational profiles.
*   `public.company_members` — Decoupled company membership roles.
*   `public.stores` — Configured virtual storefront outlets.
*   `public.products` — B2B catalog items.
*   `public.product_images` — Product gallery media.
*   `public.categories` — Hierarchical product taxonomy.
*   `public.company_media` — Verification documents, factory photos, and certificates.
*   `public.rfqs` — Buyer Request for Quote records.
*   `public.suppliers` — Legacy read-only supplier profiles.

---

## 2. Deprecation Strategy (Merging Legacy Suppliers)

To eliminate the twin-query technical debt between the legacy directory and modern marketplace:
1.  **Data Migration:** Extract records from `public.suppliers`, map them to `public.companies`, and populate missing fields with standard fallbacks.
2.  **Foreign Key Migration:** Re-link legacy `rfqs.supplier_id` entries to the newly created `companies.id` equivalent.
3.  **Deprecation Plan:** Flag the `public.suppliers` table as read-only. In Phase 3, drop the `suppliers` table and its associated indexes completely.

---

## 3. Future Schema Additions

To support real-time chat, social media feeds, and custom configurations, we specify the following future tables:

### 3.1 Table: `public.conversations`
Establishes discrete communication threads between buyers and suppliers.

```sql
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_buyer_company_conversation UNIQUE (buyer_id, company_id)
);
```

### 3.2 Table: `public.messages`
Stores actual real-time chat messages.

```sql
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    text TEXT,
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 Table: `public.commercial_posts`
Stores social updates and vertical video links published by suppliers.

```sql
CREATE TABLE public.commercial_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    caption TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Idempotent Migration Strategy

To prevent errors caused by pre-existing tables or partial updates, all migrations must be written defensively:

```sql
-- 1. Add columns defensively before creating indexes or policies on them
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS tax_identifier TEXT;

-- 2. Ensure referenced tables are defined sequentially before their foreign keys are declared
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- 3. Use IF NOT EXISTS for indexes
CREATE INDEX IF NOT EXISTS companies_tax_identifier_idx ON public.companies(tax_identifier);
```

---

## 5. Row-Level Security (RLS) Strategy

Row-Level Security must be enabled on all tables to protect sensitive contact details (PII) and ensure secure editing permissions.

```
                              PUBLIC TABLES
                                    |
        +---------------------------+---------------------------+
        |                                                       |
  PUBLICLY READABLE                                       STRICTLY SECURED
  (Select: true)                                          (Requires Verification)
        |                                                       |
        ├── companies (Public profiles)                         ├── rfqs (Select restricted)
        ├── stores (Active storefronts)                        ├── conversations (Participant check)
        ├── products (Active catalogs)                          └── messages (Participant check)
        └── product_images (Public gallery)
```

### 5.1 RLS Rules
*   **Public Access:** `companies`, `stores`, `products`, `product_images`, and `categories` are publicly readable (`USING (true)`).
*   **Write Restriction:** Write actions (INSERT, UPDATE, DELETE) are restricted to authenticated company members verified in `public.company_members`.
*   **Sourcing Privacy (RFQs):** Public read is blocked. Read and write actions are restricted to the submitting buyer and the target company's members.

---

## 6. Performance & Index Optimization

To maintain rapid page loads on slow mobile networks, we define strict indexing guidelines:

*   **B-Tree Indexes:** Enforced on all foreign keys, unique constraint columns, and filter targets (e.g., `city`, `business_type`, `is_active`).
*   **Generalized Inverted Index (GIN):** Applied to array columns in `public.companies` (such as `supported_languages` and `export_markets`) to accelerate multi-tag filtering queries.
*   **Index List Example:**
    ```sql
    CREATE INDEX IF NOT EXISTS products_store_slug_idx ON public.products(store_id, slug);
    CREATE INDEX IF NOT EXISTS companies_city_idx ON public.companies(city);
    ```
