# ALSOUK — INFORMATION ARCHITECTURE SPECIFICATION (05_INFORMATION_ARCHITECTURE)

**Author:** Chief Product Officer & Lead UX Architect
**Status:** Approved Product Blueprint
**Target Audience:** Engineering, Frontend, and Design Teams
**Document Scope:** Complete Sitemap, Page Relationships, Deep Linking Schemas, and Navigation flows

---

## 1. System Hierarchical Structure (Sitemap)

The ALSOUK system uses a modular, mobile-optimized hierarchy, grouping routes based on authentication state, public discovery, and administration.

```
                              ROOT (/)
                                 |
        +------------------------+------------------------+
        |                                                 |
  PUBLIC PAGES                                      PROTECTED PAGES
  (Accessible to All)                               (Requires Auth)
        |                                                 |
        ├── /login                                        ├── /account
        ├── /register                                     │     ├── Profile
        ├── /forgot-password                              │     ├── Products (Lister/Editor)
        ├── /discover                                     │     ├── RFQs (Inbox)
        ├── /categories                                   │     ├── Messages (Realtime Inbox)
        │     └── /[slug]                                 │     └── [Locked Advanced Tools]
        ├── /products                                     ├── /admin
        │     └── /[id]                                   │     └── /rfqs
        ├── /companies                                    └── /messages
        │     └── /[slug]                                       └── /[id]
        ├── /stores
        │     └── /[slug]
        └── /rfq
```

---

## 2. Navigation Architecture

To accommodate our 90%+ mobile user base, ALSOUK implements a dual-navigation framework:

```
+-----------------------------------------------------------------+
| Sticky Header (64px)                                            |
| [Local Logo]           [Global Language Selector]      [Search] |
+-----------------------------------------------------------------+
|                                                                 |
|                      Main Viewport Area                         |
|                                                                 |
+-----------------------------------------------------------------+
| Mobile Bottom Navigation (70px)                                 |
| (Home)      (Categories)      (RFQ)      (Messages)   (Account) |
+-----------------------------------------------------------------+
```

### 2.1 Sticky Header Navigation (64px)
*   **Presence:** Persistent across all public and account pages.
*   **Components (Left-to-Right LTR / Right-to-Left RTL):**
    1.  **ALSOUK Logo:** Returns the user to the root page (`/`).
    2.  **Global Language Selector:** Toggles between English (`en`), French (`fr`), and Arabic (`ar`). Triggers a context update in the `LanguageProvider` and applies `<html dir="rtl">` when Arabic is selected.
    3.  **Search Icon/Bar:** Opens the overlay search panel.

### 2.2 Mobile Bottom Navigation (70px)
*   **Presence:** Persistent on all mobile viewports.
*   **Items (Left-to-Right LTR):**
    1.  **Home (`/`):** Houses the 9 structural home sections.
    2.  **Categories (`/categories`):** Navigates to the hierarchical taxonomy dictionary.
    3.  **RFQ (`/rfq`):** Direct link to the buyer sourcing submission engine.
    4.  **Messages (`/messages`):** Accesses the active negotiation chat inbox.
    5.  **Account (`/account`):** Directs to the personal center or supplier dashboard.

---

## 3. Dashboard Navigation (Progressive Disclosure Flow)

The merchant workspace (`/account`) uses a progressive layout to avoid overwhelming new suppliers:

```
+-----------------------------------------------------------------+
| Account Header (User Metadata Card & Role Selector)             |
+-----------------------------------------------------------------+
| Standard Tabs:                                                  |
| [ Profile ]      [ Products ]      [ RFQs ]      [ Messages ]   |
+-----------------------------------------------------------------+
| Locked Section Panel (With Lock Icons):                          |
| [Padlock] [ Activate Advanced Tools (Primary CTA Button) ]      |
| (Locked tabs: Storefront, Export Target, Certs, Gallery, Langs)  |
+-----------------------------------------------------------------+
```

### 3.1 Initial Workspace (Locked State)
On onboarding completion, the merchant can access only four essential tabs:
1.  **Profile:** Basic personal metadata (Avatar, Full Name, City, Country) and read-only auth credentials.
2.  **Products:** The quick lister interface and a simplified list of active products.
3.  **RFQs:** A read-only inbox displays matched public sourcing requests.
4.  **Messages:** Direct access to real-time chat threads.

### 3.2 Advanced Workspace (Unlocked State)
When the user clicks the "Activate Advanced Tools" button, the UI unlocks the remaining advanced tabs:
5.  **Website Strategy:** Manage external website links and domain associations.
6.  **Export Markets:** Set export countries (e.g., Algeria, Libya, France) and supported trade languages.
7.  **Verification Center:** Upload official tax registration (Matricule Fiscal) and audit documents.
8.  **Certificates Gallery:** Manage ISO and quality credentials.
9.  **Storefront Media:** Update storefront banners and gallery carousels.

---

## 4. Search and Discovery Flow

Search is optimized for conversational ease on mobile viewports:

```
[Tap Search Bar] -> [Search Overlay Modal] -> [Search Results Page (/products)]
                                                     |
                                            +--------+--------+
                                            |                 |
                                      [Refine Filter]  [Refine Category]
                                      (City, MOQ, TND)  (Sub-categories)
```

1.  **Entry Point:** The user taps the Search Bar in the Sticky Header.
2.  **Search Overlay Modal:** Displays a full-screen input field, recently viewed products, and popular trending search terms.
3.  **Results Execution (`/products?q=...`):** On hitting enter, the user is redirected to the dynamic `/products` page.
4.  **Filtering & Refinement:**
    *   **Category Refinement:** Horizontal rail containing active subcategories.
    *   **Location Filter:** Quick-select dropdown for major Tunisian cities.
    *   **Commercial Filters:** Sliders for Minimum Order Quantity (MOQ) and Price range (TND).

---

## 5. Deep Linking Schemas

SOUKI uses human-readable, SEO-friendly slugs for public routing. This ensures that sharing a storefront link via WhatsApp or social media displays clean previews.

| Target Resource | Deep Link Pattern | Database Field Mapping |
| :--- | :--- | :--- |
| **Product Profile** | `https://alsouk.com/products/[id]` | `public.products.id` (UUID) |
| **Company Details** | `https://alsouk.com/companies/[slug]` | `public.companies.slug` (text) |
| **Virtual Storefront** | `https://alsouk.com/stores/[slug]` | `public.stores.slug` (text) |
| **Category Archive** | `https://alsouk.com/categories/[slug]`| `public.categories.slug` (text) |
| **Direct Chat Thread** | `https://alsouk.com/messages/[id]` | `public.conversations.id` (UUID) |

---

## 6. Information Relationships (Entity-Relationship Model)

```
   [auth.users] (1) <------- (1..N) [company_members] (N) -------> (1) [companies]
                                                                        |
                                                               (1)      | (1)
                                                                +-------+-------+
                                                                |               |
                                                                v               v
                                                            [stores] (1)  [company_media] (N)
                                                                |
                                                                v (1..N)
                                                            [products]
                                                                |
                                                                v (1..N)
                                                         [product_images]
```

*   **User to Company:** Managed via `company_members`. Supports multi-user access (e.g., Owner, Editor, Viewer).
*   **Company to Store:** One-to-many relationship (`companies.id` references `stores.company_id`). Allows companies to operate multiple brand storefronts.
*   **Store to Product:** One-to-many relationship (`stores.id` references `products.store_id`).
*   **Product to Images:** One-to-many relationship (`products.id` references `product_images.product_id`).
