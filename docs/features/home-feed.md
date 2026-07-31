# ALSOUK Home Discovery Feed Specification

## 1. Overview
The Home Feed is the primary discovery experience of ALSOUK, transitioning the homepage from a static listing index to a real-time, database-powered social commerce loop. It displays published commercial updates from verified factories and suppliers across Tunisia and North Africa, supporting infinite scroll with cursor-based pagination.

---

## 2. Architecture
The Home Feed reuses the robust Social Content Foundation:
*   **Data Source:** Pulls dynamically from `public.commercial_posts` joined with `public.companies` (for logo, name, verification status, and slug parameters).
*   **Service API (`lib/services/posts-service.ts`):** Exposes `fetchFeedPostsCursor` which implements production-grade cursor-based pagination.
*   **Component (`components/home/home-feed.tsx`):** Handcrafted mobile-first layout implementing:
    *   Dynamic filter navigation tabs ("All", "Following", "Nearby", "Categories").
    *   Smooth auto-scrolling horizontal media rails with snap-x alignment.
    *   State handlers for loading (skeletons), offline connectivity, network errors (retry), and empty databases.

---

## 3. Query Flow
The feed is loaded via asynchronous client queries adhering strictly to Postgres Row-Level Security:

1.  **Request Parameters:**
    *   `limit`: Number of posts per chunk (defaults to `5` for optimal mobile loading).
    *   `cursor`: ISO timestamp of the last loaded post (enables cursor pagination).
2.  **SQL Operation (`fetchFeedPostsCursor`):**
    ```sql
    SELECT cp.*, c.name, c.slug, c.logo_url, c.verification_tier, c.verified
    FROM public.commercial_posts cp
    LEFT JOIN public.companies c ON cp.company_id = c.id
    WHERE cp.status = 'published' AND cp.deleted_at IS NULL
    -- If cursor is provided:
    AND cp.created_at < :cursor
    ORDER BY cp.created_at DESC
    LIMIT :limit;
    ```
3.  **Cursor Calculation:** The next cursor is resolved server-side from the `createdAt` timestamp of the last element in the returned posts array.

---

## 4. Rendering Strategy & UX Placeholders
*   **Image Lazy Loading:** Images use the Next.js `<Image>` component with `loading="lazy"` and horizontal snapping to keep viewport transitions rapid on slow Tunisian cellular networks.
*   **Skeleton Loading:** When initial query is pending, mock card skeletons with subtle pulse animations are rendered.
*   **Filters & Placeholders:**
    *   **Following:** Informative empty state prompting buyers to follow suppliers.
    *   **Nearby:** Displays local supply notices matching cities like Sfax, Monastir, and Tunis.
    *   **Categories:** Dynamic sector selection layout.
*   **Offline / Error Safe:** Monitors `navigator.onLine` and query outcomes to display graceful WiFi-Off and Retry cards.

---

## 5. Security & Privacy
*   **Least-Privilege SELECT:** The query strictly checks `status = 'published' AND deleted_at IS NULL`. Any merchant draft or soft-deleted post remains totally invisible to the public feed.
*   **RLS Enforcement:** Restricts read accesses safely at the database levels, fully protecting supplier secrets.

---

## 6. Future Extensions
1.  **Supply Recommendation AI:** Integrate PostgreSQL vector embeddings to rank and sort updates based on the buyer's historical sourcing searches.
2.  **Direct RFQ Card Attachment:** Allow merchants to attach active RFQ sourcing cards directly into their commercial posts to accelerate negotiations.
