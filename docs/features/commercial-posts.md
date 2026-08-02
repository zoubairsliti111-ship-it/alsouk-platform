# SOUKI Commercial Posts Feature Specification

## 1. Overview
The Commercial Posts feature provides the social B2B core foundation of ALSOUK. Rather than relying on static business directory listings, merchants (suppliers) can publish rich-text updates, daily shipments, special discount catalogs, and media announcements. These posts are pushed in real-time to the public Discover Feed and the Company's Profile Feed, creating a high-engagement SOUKI social loop.

---

## 2. Architecture
The architecture comprises a secure decoupling of posts, companies, and authors.
*   **Database Table:** `public.commercial_posts` handles post persistence, status management, and metadata.
*   **Storage Bucket:** `commercial-posts` stores uploaded image attachments securely.
*   **Service Layer (`lib/services/posts-service.ts`):** Mediates between client/server actions and Supabase, enforcing inputs and membership bounds.
*   **UI Components:**
    *   **`components/marketplace/merchant-posts.tsx` (Dashboard view):** Full CRUD editor with real-time file-to-bucket image upload, validations, draft/publishing toggles, and views indicators.
    *   **`components/discover-feed.tsx` (Social Discovery feed):** Fully database-driven interactive cards with infinite snapping and direct business WhatsApp CTA buttons.
    *   **`components/marketplace/company-details.tsx` (Company profile updates):** Interactive feed showing active business announcements and stock status.

---

## 3. Database Schema
```sql
CREATE TABLE public.commercial_posts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID        NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  author_id    UUID        REFERENCES auth.users (id) ON DELETE SET NULL,
  status       TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  visibility   TEXT        NOT NULL DEFAULT 'public',
  content      TEXT        NOT NULL,
  images       TEXT[]      NOT NULL DEFAULT '{}'::text[],
  attachments  JSONB       NOT NULL DEFAULT '[]'::jsonb,
  view_count   INTEGER     NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ
);
```

### Performance Indexes
```sql
CREATE INDEX IF NOT EXISTS commercial_posts_company_id_idx ON public.commercial_posts (company_id);
CREATE INDEX IF NOT EXISTS commercial_posts_author_id_idx ON public.commercial_posts (author_id);
CREATE INDEX IF NOT EXISTS commercial_posts_status_idx ON public.commercial_posts (status);
CREATE INDEX IF NOT EXISTS commercial_posts_deleted_at_idx ON public.commercial_posts (deleted_at);
CREATE INDEX IF NOT EXISTS commercial_posts_created_at_idx ON public.commercial_posts (created_at DESC);
```

---

## 4. API & Mutations Flow
The frontend invokes CRUD functions from `posts-service.ts` backed by Row-Level Security:

1.  **Create Post:**
    *   Inputs: `companyId`, `content`, `images`, `status`, `visibility`.
    *   Flow: Validates length and file limits, checks auth status, inserts into `public.commercial_posts`.
2.  **Update Post:**
    *   Inputs: `postId`, partial fields (`content`, `images`, `status`, `visibility`).
    *   Flow: Checks validations, updates matched ID.
3.  **Soft Delete Post:**
    *   Updates `deleted_at` timestamp to now. Keeps the record in DB for auditable history but filters out of public feed queries.
4.  **Publish / Unpublish:**
    *   Direct state toggle updating `status` column to `'published'` or `'draft'`.
5.  **Fetch Feed Posts (Joined Query):**
    ```sql
    SELECT *, companies(name, slug, logo_url, verification_tier, verified)
    FROM public.commercial_posts
    WHERE status = 'published' AND deleted_at IS NULL
    ORDER BY created_at DESC;
    ```

---

## 5. Security & Row-Level Security (RLS)
The database enforces strict privacy constraints on `public.commercial_posts` and the `commercial-posts` storage bucket:

### Post Policies
*   **SELECT (Public):** Everyone can read published updates (`status = 'published' AND deleted_at IS NULL`).
*   **SELECT (Merchant):** Company members can view drafts, deleted posts, and stats for their specific company.
*   **INSERT / UPDATE / DELETE:** Restricted to authenticated members of the company:
    ```sql
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = public.commercial_posts.company_id
        AND cm.user_id = auth.uid()
    )
    ```

### Storage Bucket Policies
*   **SELECT (Public):** Anyone can read files in the `commercial-posts` bucket.
*   **INSERT / DELETE:** Restricted to authenticated members of any registered company on ALSOUK. Anonymous uploads are rejected.

---

## 6. Future Extensions
1.  **TikTok-style vertical looping videos (`/discover` integration):** Support uploading optimized short videos (.mp4/.webm under 5MB) linked to products.
2.  **Interactive Product Tags:** Add a list of product IDs inside `attachments` metadata to let buyers tap tags inside a commercial post and jump directly to product purchase/quote forms.
3.  **Live Commerce Streams:** Future integration of interactive live sales directly hosted on ALSOUK homepage.
