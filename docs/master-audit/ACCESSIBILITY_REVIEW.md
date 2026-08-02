# ALSOUK — ACCESSIBILITY AND REGIONALIZATION SPECIFICATION

**Author:** Lead Product Engineer & Product Architect
**Status:** Complete
**Date:** July 2026

---

## 1. Regionalization & Accessibility Overview

ALSOUK is built for a diverse B2B audience across North Africa, requiring full support for Arabic, French, and English. The platform must offer LTR/RTL layout support alongside clear navigation to ensure it is accessible to all users.

---

## 2. Multi-Language RTL Layout Architecture

- **Context-Aware Direction:** The platform uses a custom `LanguageProvider` to handle text direction. It automatically updates the HTML direction attribute to `dir="rtl"` for Arabic layouts and `dir="ltr"` for French and English.
- **Tailwind Logical Properties:** For robust layout alignment, ALSOUK uses Tailwind logical properties instead of hardcoded directional overrides.
  - Spacers use `ms-*` (margin-start) and `me-*` (margin-end) instead of `ml-*` or `mr-*`.
  - Padding uses `ps-*` (padding-start) and `pe-*` (padding-end) instead of `pl-*` or `pr-*`.
- **Outcome:** This logical structure allows components to flip automatically and scale cleanly when the user switches languages, ensuring a native experience in both LTR and RTL orientations.

---

## 3. Keyboard Navigation & Focus Ring Indicators

- **Primitive Elements:** Dynamic elements, like modals and tabs, are built on top of `@base-ui/react` primitives. These primitives provide native support for standard keyboard controls (e.g. `Tab` to navigate, `Esc` to close).
- **Focus States:** High-visibility focus indicators (such as `focus-visible:ring-2 focus-visible:ring-primary`) outline active inputs and buttons. This ensures that users navigating with keyboards or assistive devices can clearly track their position.

---

## 4. Mobile Ergonomics & Touch Target Standards

- **Touch Guidelines:** Since the platform is optimized for mobile views (reference size: 390px), buttons and links maintain a minimum size of 44px to make them easy to tap.
- **Bottom Navigation Padding:** The 70px bottom navigation bar uses logical properties and safe-area margins (e.g. `pb-[env(safe-area-inset-bottom)]`) to prevent controls from overlapping with iOS or Android system bars.
- **Input Fields:** Input fields utilize large, touch-friendly tap heights on mobile screens, making it easy for merchants to edit profiles and manage product listings.
