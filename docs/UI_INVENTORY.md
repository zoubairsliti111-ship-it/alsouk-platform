# ALSOUK — COMPREHENSIVE UI INVENTORY & SPECS

**Date:** August 2026
**Document:** Exhaustive UI Elements Registry and Status
**Product Style:** Mobile-First, B2B SOUKI Design Guidelines

---

## 1. Page & Route Registry

Every public and protected page is cataloged below, highlighting its purpose, components, visual layout structure, and verified status.

### 1.1 Home Screen
- **Route:** `/`
- **File:** `app/page.tsx`
- **Visual Presentation:** Mobile-first layout consisting of exactly 9 ordered layers, completely excluding any large landing banners to focus entirely on B2B interactions:
  1. **Sticky Header (64px height):** Features the ALSOUK logo, localized language switcher (EN, FR, AR), notifications bell with active unread indicators, and a dynamic user avatar.
  2. **Search Bar:** Global search input box triggering queries over suppliers and catalogs.
  3. **Today's Opportunities:** Left-to-right scrolling marquee displaying live-activity sourcing alerts.
  4. **Categories Rail:** Exactly 10 horizontal scrolling circle category icons utilizing Tailwind CSS `snap-x` and hidden scrollbars for optimal regional thumb swipes.
  5. **Featured Suppliers Rail:** Cards showcasing verified manufacturers, locations, and direct contact hooks.
  6. **Featured Products Rail:** Cards showing specs, price brackets, and MOQ targets.
  7. **Live Marketplace Rail:** Highlights active video streams and products on air.
  8. **Upcoming Exhibition Banners:** Highlights virtual tradeshows with direct exploration entry points.
  9. **RFQ Sourcing Banner:** Deep premium blue canvas with direct quote requests.
- **Interactive Modals:** Search filters drawer, Language selector.
- **Verified Status:** **100% COMPLETE & OPERATIONAL** (All horizontal scroll rails operate correctly under mobile touch viewports; languages toggle flawlessly).

### 1.2 Discover Feed Screen
- **Route:** `/discover`
- **File:** `app/discover/page.tsx`
- **Visual Presentation:** A premium, TikTok-style full-viewport vertically snapping media player focused entirely on product demonstrations and factory walkthroughs:
  - Supports swipe/scroll vertical snapping using CSS `snap-y snap-mandatory`.
  - Right-hand vertical action menu overlays: Save (Heart icon with active toggle), Contact (launches AI Assistant), Send RFQ (pre-fills supplier ID), and Share.
  - Absolute bottom info overlay: Displays short text, verified business badge, and twin bottom action pills ("View Company" and "Visit Store").
- **Interactive Modals:** Direct chat / AI Assistant window overlay launcher.
- **Verified Status:** **100% COMPLETE & OPERATIONAL** (Snapping container functions correctly on touch gestures; cursor pagination loads more posts efficiently).

### 1.3 Categories Directory Screen
- **Route:** `/categories`
- **File:** `app/categories/page.tsx`
- **Visual Presentation:** Clean 2-column grid displaying all industrial sectors using high-fidelity preview cards with logical RTL text alignment.
- **Verified Status:** **100% COMPLETE**

### 1.4 Company Profile Screen
- **Route:** `/companies/[slug]`
- **File:** `app/companies/[slug]/page.tsx`
- **Visual Presentation:** Publicly facing profile optimized for buyer reassurance. Divided into:
  - Hero Header with cover image and circular logo overlap.
  - Verified trust badges.
  - Dynamic Tabs: About, Products, Feed Updates.
  - Defensive Logic: Automatically hides unpopulated tabs (e.g., certificates, languages) to maintain clean business profiles.
- **Verified Status:** **100% COMPLETE**

### 1.5 Account Management Screen
- **Route:** `/account`
- **File:** `app/account/page.tsx`
- **Visual Presentation:** Fully interactive merchant profile inspired by LinkedIn and Alibaba:
  - Onboarding Wizard: 3-step wizard panel (Step 1: Company basic facts; Step 2: Contact handles & socials; Step 3: Bio & Logo) with a transition to product publishing.
  - Interactive Action Panel: QR Code Card generator modal, Copy Profile link, WhatsApp toggle.
  - Tabs Panel: Dynamically hides or displays tabs based on the company's `profile_level` row.
- **Verified Status:** **100% COMPLETE & OPERATIONAL** (Wizard steps save changes successfully; profile levels dynamically adjust visual tab visibility).

### 1.6 Exhibition Detail Screen
- **Route:** `/exhibitions/[slug]`
- **File:** `app/exhibitions/[slug]/page.tsx`
- **Visual Presentation:** Virtual tradeshow hall index featuring:
  - Cover banner and event overview counters.
  - Search and Sort bar (featured first, alphabetical, booth numbers).
  - Category filters rail.
- **Verified Status:** **100% COMPLETE**

### 1.7 Exhibition Booth Screen
- **Route:** `/exhibitions/[slug]/booths/[id]`
- **File:** `app/exhibitions/[slug]/booths/[id]/page.tsx`
- **Visual Presentation:** Virtual booth with:
  - Floating action menu.
  - Local Private Notes card.
  - B2B Meeting Scheduler modal.
  - Catalog downloads and media galleries.
- **Verified Status:** **100% COMPLETE**

---

## 2. Modal & Dialog Catalog

All visual overlay modals inside the platform are cataloged below:

| Modal Name | Triggering Component | Purpose | Status |
| :--- | :--- | :--- | :---: |
| **B2B Meeting Scheduler** | `ExhibitionBoothContent` | Lets buyers request virtual trade consultations | **Works** |
| **Quick Quote Dialog** | `ExhibitionBoothContent` | Direct RFP submission to the exhibitor | **Works** |
| **vCard QR Card** | `ExhibitionBoothContent` | Generates scanner-ready contact information | **Works** |
| **Language Selector** | `SiteHeader` | Sets operating languages and direction | **Works** |
| **Search Filters Drawer** | `HomeSearch` | Filter directory by location and scale | **Works** |
| **Submit for Review Dialog**| `BoothDashboard` | Toggles booth submitted status and locks forms | **Works** |

---

## 3. Tab Systems Specifications

### 3.1 Account Tabs (Progressive Plan Capabilities)
Visible tabs inside `/account` automatically adapt based on the company's assigned plan level (`starter`, `business`, `enterprise`):

1. **Starter Level (Level 1):**
   - **About & Trade:** Basic business parameters.
   - **Instagram Feed:** Feed updates publishing.
   - **Featured Products:** Limited product catalog.
   - **Simple Gallery:** Photo grid.
   - **Buyer Reviews (12):** Simulated reviews.

2. **Business Level (Level 2):**
   - *All Starter tabs, plus:*
   - **Gallery & Catalog:** Digital catalog PDF uploads.

3. **Enterprise Level (Level 3):**
   - *All Business tabs, plus:*
   - **Trade Exhibitions:** Association and management of trade shows.
   - **Gallery & Quality:** High-level factory certifications and specifications.
