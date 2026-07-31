# ALSOUK — SEO AND METADATA ARCHITECTURE SPECIFICATION

**Author:** Lead Product Engineer & Product Architect
**Status:** Complete
**Date:** July 2026

---

## 1. SEO Implementation Strategy

B2B sourcing platforms rely heavily on organic search visibility. High-quality SEO ensures that Tunisian manufacturers, agricultural exporters, and local wholesalers are discoverable on Google when buyers search for products from North Africa.

---

## 2. Metadata Structure & OpenGraph Mapping

- **Global Config:** The root layout defines baseline metadata (such as titles, descriptions, and keywords) dynamically.
- **Dynamic Meta tags:** Product detail pages (`app/products/[id]/page.tsx`) and company profile routes (`app/companies/[slug]/page.tsx`) generate localized title tags (e.g. "Sfax Olive Oils — Verified Tunisian Exporter") to improve search ranking relevance.
- **OpenGraph Social Cards:** ALSOUK implements OpenGraph (OG) configurations to ensure company profiles display professional summaries and cover images when shared on networks like LinkedIn, Facebook, and WhatsApp.

---

## 3. Crawling Assets: `robots.ts` and `sitemap.ts`

- **Robots Config:** The `app/robots.ts` file instructs search engines to index public company profiles, catalogs, and categories, while keeping protected user dashboard folders (like `/account` and `/admin`) crawl-safe and private.
- **Sitemap Generator:** The dynamic sitemap (`app/sitemap.ts`) maps out active routes, categories, and products, ensuring search engine bots can easily discover new inventory additions.

---

## 4. Build-Time Static Site Generation (SSG) Considerations

- **Absolute URL Resolution:** A common issue during static site builds (SSG) is parser failures caused by relative `fetch` calls. To prevent this, server-side data fetching logic resolves calls to absolute URLs using the helper parameter `SITE_URL` from `lib/site.ts` (e.g. `typeof window === "undefined"` resolves to production domains).
- **Benefits:** This setup ensures that dynamic routes can be compiled and deployed smoothly during automated production builds on Vercel without triggering build errors.
