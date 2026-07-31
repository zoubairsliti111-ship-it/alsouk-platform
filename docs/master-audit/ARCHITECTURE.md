# ALSOUK — SYSTEM ARCHITECTURE SPECIFICATION

**Author:** Lead Product Engineer & Product Architect
**Status:** Complete
**Date:** July 2026

---

## 1. System Overview

ALSOUK is architected as a Next.js (React 19, Next.js 16) single-page and server-rendered web application, backed by Supabase (PostgreSQL, Row Level Security, and Realtime). It uses Tailwind CSS v4 for UI styling, custom i18n providers for RTL/LTR language handling, and a modular service layer for Supabase communications.

```
                  +----------------------------------------------+
                  |               Next.js Frontend               |
                  |  (App Router, React 19, Server & Client)     |
                  +----------------------+-----------------------+
                                         |
                                         | PostgREST / JSON RPC
                                         v
                  +----------------------+-----------------------+
                  |               Supabase Backend               |
                  | (Auth, Storage, PostgreSQL DB with RLS policies)|
                  +----------------------------------------------+
```

---

## 2. Directory Structure Audit

The workspace is highly organized, with clean separations between route views, database migrations, layout utilities, and reusable UI components:

```
├── app/                        # Next.js App Router root
│   ├── (auth)/                 # Route Group: Auth pages (login, register, forgot-password)
│   ├── account/                # Interactive User & Company dashboard
│   ├── admin/                  # Administrative operations (e.g. RFQ listings)
│   ├── api/                    # Server-side Route Handlers (REST endpoints)
│   ├── categories/             # Marketplace categories directory
│   ├── companies/              # B2B company public profile directory
│   ├── discover/               # TikTok-style vertical short videos discover feed
│   ├── messages/               # In-app conversational chat placeholder
│   ├── products/               # Marketplace catalogs and product details
│   ├── rfq/                    # Request for Quote submission views
│   ├── stores/                 # Generated customizable storefronts
│   ├── suppliers/              # Legacy suppliers directory
│   ├── globals.css             # Tailwind v4 globals stylesheet
│   └── page.tsx                # Homepage featuring 9 structural sections
├── components/                 # Shared UI and Domain Components
│   ├── ai/                     # AI assistant widget & prompt helpers
│   ├── directory/              # Legacy supplier profile listings
│   ├── home/                   # Specialized homepage components (Opportunities, Live, Shorts)
│   ├── marketplace/            # Modern marketplace listings, cards, store themes
│   ├── rfq/                    # RFQ creation & details dialogs
│   └── ui/                     # Primitives (Tailwind styled buttons, components)
├── docs/                       # Project Documentation & Guides
│   └── master-audit/           # Master Audit Outputs (Target)
├── lib/                        # Shared Utilities & Services
│   ├── ai/                     # OpenAI compatible completions layer
│   ├── domains/                # Domain-specific data objects
│   ├── services/               # Modular service orchestration
│   ├── supabase/               # Supabase JS client builders & services
│   ├── directory-data.ts       # Type interfaces & mock datasets
│   ├── directory-i18n.ts       # Internationalization translation maps
│   ├── format.ts               # Price, numbers & date formatting
│   ├── i18n.ts                 # Dynamic Language structures
│   └── utils.ts                # Tailwind Class merger utilities
└── supabase/                   # Supabase Database configuration
    ├── migrations/             # Idempotent DB migrations (0001 to 0005)
    ├── schema.sql              # Core SQL table layouts
    ├── seed.sql                # Suppliers directory mock seed
    └── seed_marketplace.sql    # Modern companies & products seed
```

---

## 3. App Router & Page Navigation Mapping

Next.js App Router forms the core navigational boundary. Below is a detailed mapping of files, server/client paradigms, and purposes:

| Route Path | Type | File Path | Scope & Core Purpose |
| :--- | :---: | :--- | :--- |
| `/` | Client | `app/page.tsx` | Highly structured mobile-first homepage. Features sticky header, horizontal rails, and categories. |
| `/login` | Client | `app/login/page.tsx` | Custom phone-first conversion login form. |
| `/register` | Client | `app/register/page.tsx` | New account acquisition with Tunisia phone validation. |
| `/forgot-password` | Client | `app/forgot-password/page.tsx` | Client-side email password reset trigger. |
| `/account` | Client | `app/account/page.tsx` | Unified progressive profile and company storefront wizard. |
| `/discover` | Client | `app/discover/page.tsx` | Snapping TikTok-style video showcase feed for social commerce. |
| `/rfq` | Client | `app/rfq/page.tsx` | Multi-step RFQ generation for regional buyers. |
| `/messages` | Client | `app/messages/page.tsx` | In-app transactional conversation threads (Placeholder). |
| `/categories` | Client | `app/categories/page.tsx` | Browse hierarchical catalogs and product taxonomies. |
| `/categories/[slug]` | Client | `app/categories/[slug]/page.tsx` | Filtered marketplace products matching specific category. |
| `/companies` | Client | `app/companies/page.tsx` | Discover and search matching B2B verified manufacturers. |
| `/companies/[slug]` | Client | `app/companies/[slug]/page.tsx` | Publicly viewable company profile featuring business classification. |
| `/stores/[slug]` | Client | `app/stores/[slug]/page.tsx` | Generated customized storefront featuring company catalogs. |
| `/products` | Client | `app/products/page.tsx` | Multi-filter B2B catalog search and discovery view. |
| `/products/[id]` | Client | `app/products/[id]/page.tsx` | Detailed B2B specifications, minimum orders, and messaging CTAs. |
| `/suppliers` | Client | `app/suppliers/page.tsx` | Legacy read-only directories layout of Tunisian suppliers. |
| `/suppliers/[id]` | Client | `app/suppliers/[id]/page.tsx` | Public profile directory matching legacy suppliers details. |
| `/admin/rfqs` | Client | `app/admin/rfqs/page.tsx` | Backend monitoring panel for managing submitted buyer RFQs. |

---

## 4. Shared Layouts & Composition Architecture

ALSOUK utilizes wrapper components to implement layouts, global configuration context providers, and responsive container controls:

1. **Root Layout (`app/layout.tsx`):** Wraps the entire Next.js tree. Injects global CSS, triggers the `AuthProvider` for login status, and defines global page metadata.
2. **Marketplace Shell (`components/marketplace/shell.tsx`):** Wraps all marketplace route directories. Ensures consistent structural padding and handles main header scroll offsets.
3. **Admin Layout (`app/admin/layout.tsx`):** Enforces a professional sidebar layout for back-office administrators.
4. **Sticky Header (`components/site-header.tsx`):** Fixed to the top (height: 64px). Houses localized logos, search, and dynamic global language selectors.
5. **Mobile Bottom Navigation (`components/mobile-bottom-nav.tsx`):** Sticky viewport bottom layout (height: 70px) designed for LTR/RTL. Houses Home, Categories, RFQ, Messages, and Account triggers with premium safe-area-inset padding on iOS and Android devices.

---

## 5. Providers & Context Layer

The application operates globally on three custom react context provider wrappers:

- **`LanguageProvider` (`components/language-provider.tsx`):** Resolves active language choice (`en`, `fr`, `ar`). Manages LTR/RTL layout orientation (`dir="ltr"` or `dir="rtl"`) on nested elements. Reads translation maps dynamically.
- **`AuthProvider` (`components/auth-provider.tsx`):** Listens to live state updates from Supabase's browser auth client (`onAuthStateChange`). Exposes active session profiles globally.
- **`AI Widget Assistant` (`components/ai/assistant-widget.tsx`):** Active on every route. Enables situational B2B prompts (such as context-aware supplier inquiries).

---

## 6. Business Service Layers

Supabase operations are completely abstracted into a structured directory under `lib/supabase/` to decouple database implementations from visual UI presentation:

- **`company-service.ts`:** Manages transactional operations for the modernized centralized company entities.
  - Handles the dual-membership join table queries (`company_members`).
  - Computes profile health ratings (`calculateProfileCompletion`).
  - Implements the automated default storefront insertion on company creation.
- **`suppliers-service.ts`:** Resolves read-only lookups on the legacy Tunisian suppliers table.
- **`rfq-service.ts`:** Handles transactional creations and assignments of buyer RFQs.
- **`rest.ts` & `client.ts`:** Build defensive fallback Supabase clients to avoid compile-time crashes if environment keys are missing during production server build-time.
- **`middleware.ts`:** Inspects token expiration and handles token refreshes transparently on Next.js Edge routing boundaries.

---

## 7. Data Utility & Helper Libraries

- **`lib/format.ts`:** Standardizes regional prices. Formats prices in Tunisian Dinars (د.ت) with millimes formatting (3 decimal places) using a 3.1 USD-to-TND conversion factor.
- **`lib/directory-i18n.ts`:** Supplies full translation maps across French, Arabic, and English.
- **`lib/utils.ts`:** Custom utility wrapper that merges Tailwind classes safely via `clsx` and `tailwind-merge`.
