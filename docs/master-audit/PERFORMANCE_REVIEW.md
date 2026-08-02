# ALSOUK — PERFORMANCE AND RENDERING AUDIT

**Author:** Lead Product Engineer & Product Architect
**Status:** Complete
**Date:** July 2026

---

## 1. Performance Overview

B2B users in Tunisia and North Africa often connect using mobile networks with variable bandwidth. Optimizing performance is critical for ensuring fast load times and a smooth experience across the platform.

---

## 2. Rendering Strategy Audit

- **Mixed Paradigm:** ALSOUK utilizes Next.js Server Components (RSC) to handle static content (such as categories and global settings) while using Client Components (`"use client"`) for highly interactive dashboards, onboarding workflows, and search forms.
- **Benefits:** This hybrid approach keeps initial page loads fast by serving pre-rendered HTML while maintaining smooth client-side interactions for tools like the multi-step company onboarding wizard.

---

## 3. Dynamic Assets & Image Optimizations

- **Implementation:** The homepage and discover feeds display product catalogs and company logos using Next.js's optimized `next/image` component.
- **Opportunities for Optimization:**
  - **Storage Optimization:** Transitioning from manual, raw image URLs to using Supabase Storage buckets would allow the platform to serve optimized WebP or AVIF formats automatically.
  - **Aspect Ratio Optimization:** Restricting image containers to consistent aspect ratios (such as `aspect-video` or `aspect-square`) would prevent layout shifts during image loading.

---

## 4. Bundle Sizes & Code Splitting

- **Tailwind CSS v4:** Built on Tailwind v4, the application benefits from modern CSS parsing and smaller compiled style sheets.
- **Optimization Suggestions:**
  - **Modular Icon Imports:** Consolidate custom SVG icons and ensure Lucide icons are imported using tree-shakable paths to keep JavaScript bundle sizes as small as possible.
  - **Lazy Loading Components:** Apply `next/dynamic` to lazy-load complex components, like the AI Assistant widget, so they only load when a user interacts with them. This keeps the initial page load fast on slow networks.
