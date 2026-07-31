# ALSOUK Unified Media Platform Specification

## 1. Overview
The Unified Media Platform is the central reusable media architecture for the entire ALSOUK ecosystem. Instead of having separate, duplicate file upload handlers or raw URL paste fields across different modules, all components (Company Logos, Company Covers, Product Catalogues, Commercial Post Images, Videos, Certificates, and Future Documents) leverage the same, secure full-stack media infrastructure.

---

## 2. Architecture
The system consists of three decoupled yet tightly integrated layers:
1.  **Storage:** A single, consolidated Supabase Storage bucket (`platform-media`) structured cleanly by entity type folders.
2.  **Database Model (`public.platform_media`):** A generic database table registering physical files, owners, dimensions, MIME, and sizes.
3.  **Unified Service (`lib/services/media-service.ts`):** Validates constraints, extracts dimensions dynamically, uploads to storage, and records entries in the DB.
4.  **Reusable Frontend (`components/ui/media-uploader.tsx`):** A drag-and-drop component with picker fallback, visual progress indicators, cancel/retry triggers, and previews.

---

## 3. Storage Folder Strategy
All assets are uploaded into the `'platform-media'` bucket, organized in folders by entity:
*   `companies/` — Brand Logos and Cover Banners.
*   `products/` — Catalog item images.
*   `posts/` — SOUKI Commercial update photos.
*   `videos/` — Short promotional loops and live streams.
*   `certificates/` — Supplier quality certificates.
*   `future/` — Upcoming documents or media resources.

---

## 4. Database Schema
```sql
CREATE TABLE public.platform_media (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID        NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  media_type     TEXT        NOT NULL CHECK (media_type IN ('logo', 'cover', 'product', 'post', 'video', 'certificate', 'document', 'future')),
  mime_type      TEXT        NOT NULL,
  file_size      INTEGER     NOT NULL CHECK (file_size > 0),
  width          INTEGER,
  height         INTEGER,
  duration       NUMERIC,    -- video length in seconds
  storage_bucket TEXT        NOT NULL DEFAULT 'platform-media',
  storage_path   TEXT        NOT NULL,
  public_url     TEXT        NOT NULL,
  alt_text       TEXT,
  caption        TEXT,
  position       INTEGER     NOT NULL DEFAULT 0 CHECK (position >= 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ
);
```

### Performance Optimization Indexes
```sql
CREATE INDEX IF NOT EXISTS platform_media_company_id_idx ON public.platform_media (company_id);
CREATE INDEX IF NOT EXISTS platform_media_media_type_idx ON public.platform_media (media_type);
CREATE INDEX IF NOT EXISTS platform_media_deleted_at_idx ON public.platform_media (deleted_at);
create INDEX IF NOT EXISTS platform_media_created_at_idx ON public.platform_media (created_at DESC);
```

---

## 5. Upload Flow & Validation Rules
### Validation Parameters
*   **Images:** Maximum size `5MB`. Supported MIME: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`, `image/gif`.
*   **Videos:** Maximum size `20MB`. Supported MIME: `video/mp4`, `video/quicktime`, `video/webm`.
*   **Documents / Certificates:** Maximum size `5MB`. Supported MIME: `application/pdf`, `image/png`, `image/jpeg`, `image/jpg`, `image/webp`.

### Metadata Extraction Flow
1.  **Client Selection:** The merchant drags or picks a file.
2.  **Dimension Parsing:** If the file is an image, a virtual client-side `Image` object is initialized in the browser event loop to parse dimensions (`width` and `height`) dynamically before upload.
3.  **Duration Parsing:** If the file is a video, a virtual video element is initialized to fetch its duration.
4.  **Storage Upload:** Pushes file bytes to `/platform-media/{companyId}/{entityFolder}/{fileName}`.
5.  **DB Register:** Commits validated metadata and the resolved `publicUrl` to `public.platform_media`.

---

## 6. Row-Level Security (RLS) & Permissions
*   **SELECT:** Public selective read is granted to all media assets where `deleted_at IS NULL`, ensuring instant storefront previews, product rendering, and discovery feed loading.
*   **INSERT / UPDATE / DELETE:** Strictly restricted to authenticated company members:
    ```sql
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = public.platform_media.company_id
        AND cm.user_id = auth.uid()
    )
    ```
*   **Storage Policies:** Bucket operations limit uploads and deletions strictly to authenticated company members on ALSOUK.

---

## 7. Future Expansion
1.  **Image Transcoding Pipeline:** Hook a Supabase Edge Function to dynamically compress, crop, and transcode uploaded PNG/JPEG images into `.webp` format at the CDN level.
2.  **Video Chunking / HLS Streaming:** Transcode uploaded B2B supplier videos into HTTP Live Streaming (HLS) formats for low-latency playback.
