# ALSOUK — COMPONENT AND DESIGN SYSTEM REVIEW

**Author:** Lead Product Engineer & Product Architect
**Status:** Complete
**Date:** July 2026

---

## 1. Design System Overview

ALSOUK's UI philosophy is optimized for mobile-first views with a reference width of 390px, built on Tailwind CSS v4 and @base-ui/react primitives. The layout emphasizes high-density spacing, soft rounded cards, and bold, readable typography tailored for North African screens.

---

## 2. UI Specifications & Styling Audit

### 2.1 Spacing & Grid System
- **Core Guidelines:** Section padding is standardized at 24px, with 16px padding on cards and a 16px gap on standard grid items.
- **Audit Findings:** The spacing is consistently applied across the homepage and product pages. However, on wide desktop views, the 24px layout constraints can stretch components excessively if they are not capped inside an `mx-auto max-w-5xl` container.

### 2.2 Typography Hierarchy
- **Guidelines:** Section headings are styled with bold weight, while button text uses semi-bold.
- **Audit Findings:** The hierarchy is clear. However, the system uses the default system sans-serif font stack. To improve the user experience for French and Arabic, a tailored Arabic font stack (such as `Cairo` or `Tajawal`) should be configured in the future.

### 2.3 Color System & Theme Palettes
- **Core Palette:** The brand utilizes Primary Blue (representing trust and regional trade stability) and Secondary Green (reflecting commerce and growth).
- **Audit Findings:** Colors are declared cleanly in `app/globals.css`.
- **Dark Mode Readiness:** The current implementation uses Tailwind's utility class mapping, but is primarily optimized for a light theme. A full dark-theme transition will require auditing and updating any hardcoded background colors like `bg-white` and `bg-gray-50`.

### 2.4 Buttons, Cards & Interactive UI Controls
- **Cards:** Standardized with a soft `rounded-[20px]` border radius.
- **Buttons:** Styled with regular padding and prominent touch-friendly surfaces.
- **Forms & Inputs:** Standardized with rounded-xl borders, subtle focus rings, and clear error layouts.

---

## 3. Component Consistency & Code Duplication Audit

### 3.1 Supplier Directory vs. Marketplace Companies
- **Legacy Components:** Components under `components/directory/` (e.g. `supplier-card.tsx`, `supplier-profile.tsx`) render read-only fields from the legacy `public.suppliers` table.
- **Modern Components:** Components under `components/marketplace/` (e.g. `company-card.tsx`, `company-details.tsx`) render modernized, editable business fields from `public.companies`.
- **Issue:** This dual-component architecture creates split codebase rendering paths. For example, a supplier and a company are displayed using different components, even though they represent the same underlying business entity.

### 3.2 Custom Icon Integration
- **Context:** The repository uses `lucide-react` version 1.16.0, which lacks brand icons such as Facebook, Instagram, LinkedIn, and TikTok.
- **Implementation:** The codebase correctly avoids loading missing Lucide icons by rendering custom inline SVG brand components directly.
- **Recommendation:** Consolidate these inline SVGs into a single, reusable `components/ui/brand-icons.tsx` component to prevent duplicate SVG paths across views.
