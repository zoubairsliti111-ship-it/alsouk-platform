# ALSOUK — PRODUCT FEATURE INVENTORY MATRIX

**Author:** Lead Product Engineer & Product Architect
**Status:** Complete
**Date:** July 2026

---

## 1. Feature Matrix Directory

This index catalogs every functional user experience and backend system implemented or planned across ALSOUK, categorized by their development status:

| Feature Name | Core Purpose | Current Status | Dependencies | Priority | Complexity | Recommended Next Step |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **Phone-First Authentication** | Client-side Tunisian format login and signup | ✅ Completed | Supabase Auth Client | Critical | Medium | Connect local SMS gateway for OTP login verification. |
| **First-Login Role Selection** | Interactive Buyer vs. Supplier modal metadata assignment | ✅ Completed | `AuthProvider` | High | Low | Persist state to local Next.js session without full reload. |
| **Central Company Onboarding** | Mobile-first 3-step creation wizard for business profile | ✅ Completed | `company-service.ts` | Critical | Medium | Enforce strict input validation on tax identifiers. |
| **Automated Storefront Creation** | Auto-insert storefront in DB on company creation | ✅ Completed | `public.stores` | High | Low | Allow suppliers to custom-configure store sub-sections. |
| **First Product Quick Lister** | Streamlined catalog item creation following onboarding | ✅ Completed | `public.products` | Critical | Medium | Implement bulk photo uploads directly into Supabase Storage. |
| **Tunisian Price Formatter** | Consistent Tunisian Dinar millimes layout formatting | ✅ Completed | `lib/format.ts` | High | Low | Replace static 3.1 multiplier with dynamic live currency conversion feed. |
| **Progressive Supplier Dash** | Initially locked advanced enterprise tabs layout | ✅ Completed | `app/account/page.tsx` | High | Medium | Add distinct visual padlocks on locked enterprise features. |
| **SOUKI Homepage Rails** | Sticky headers and horizontal snap scrolling rails | ✅ Completed | Tailwind CSS | Critical | Low | Lazy-load below-the-fold media rails for higher mobile speeds. |
| **SOUKI Live Discovery Feed** | TikTok snap vertical feed with direct product linkages | 🟡 Partial | Local translations map | High | High | Migrate static video structures into a `public.posts` table. |
| **Unified Search Engine** | Global combined catalog and supplier directory queries | 🟡 Partial | PostgREST Client | Critical | Medium | Introduce fuzzy search capabilities on product keywords. |
| **AI Assistant Copilot Widget** | Pluggable chatbot for context-specific trade inquiries | ✅ Completed | OpenAI completions API | High | High | Implement predefined trade tags to guide buyer prompts. |
| **Request for Quote (RFQ) Flow** | Unified buyer multi-step sourcing submission | ✅ Completed | `rfq-service.ts` | Critical | Medium | Add automatic email matched triggers to suppliers. |
| **Storefront Customizer** | Customizable themes, banners, and layout profiles | 🟡 Partial | `public.stores` | Medium | Medium | Connect layout selectors to update JSONB configuration. |
| **Company Media Assets Manager** | Factory photo uploads and ISO standard certifications | ✅ Completed | `company_media` | High | Medium | Enforce file size limits and optimize images. |
| **Interactive Messaging Inbox** | Realtime conversational inbox for regional traders | ❌ Missing | None (In-App Placeholder) | Critical | High | Implement `public.messages` and `public.conversations` tables. |
| **Saved Items / Favorites** | Save products and suppliers for offline sourcing | ❌ Missing | None | Medium | Low | Create `public.favorites` bookmark join schema. |
| **B2B Trust Certification Tiers** | Verified badge systems based on business documents | 🟡 Partial | `verification_tier` enum | High | Medium | Define clear criteria checklist inside the Account dashboard. |
| **Admin Sourcing Controller** | Central administration dashboard to review buyer requests | ✅ Completed | Service Role Client | High | Low | Build single-click export of matching RFQs to CSV format. |
| **Multi-Language Selector** | On-the-fly toggling between AR, FR, and EN layouts | ✅ Completed | `LanguageProvider` | Critical | Low | Translate product catalog tables via localized schema JSONB fields. |
| **Global Categorization Tree** | Hierarchical parent-child product classification | 🟡 Partial | `public.categories` | Critical | Medium | Implement drag-and-drop category builder for admin layout. |

---

## 2. Feature Status Definitions

- **✅ Completed:** Core business logic, backend schema, and interactive UI views are fully connected, tested, and ready for production staging.
- **🟡 Partial:** Features that are functionally visible in the frontend, but operate on static data or mocked triggers, or require further schema wiring.
- **❌ Missing:** Highly valuable planned SOUKI experiences that lack active visual interfaces and database schemas.
