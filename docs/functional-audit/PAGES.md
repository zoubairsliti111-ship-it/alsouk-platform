# ALSOUK — PAGES FUNCTIONAL INVENTORY

This file contains an exhaustive, page-by-page analysis of all 54 routes identified in the ALSOUK application directory tree (`app/`).

---

## 1. Public Marketplace Pages

### 1.1 Homepage (`/`)
* **URL:** `/`
* **Purpose:** The central social e-commerce entry point for North African B2B discovery. Omits standard large hero banners in favor of fast mobile horizontal scrolling rails.
* **Components Used:** `LanguageProvider`, `SiteHeader`, `HomeSearch`, `Opportunities`, `CategoriesSection`, `FeaturedSuppliers`, `FeaturedProducts`, `LiveMarketplace`, `UpcomingExhibitionsSection`, `RfqSection`, `AssistantWidget`, `MobileBottomNav`.
* **Sections:**
  - Section 1: Sticky Header (64px height)
  - Section 2: Interactive Search Input (with automatic suggestions)
  - Section 3: Today's Opportunities (Live dynamic leads)
  - Section 4: Categories (Exactly 10 horizontal scrolling icons with snap-x alignment)
  - Section 5: Featured Suppliers (B2B verified badges)
  - Section 6: Featured Products Grid
  - Section 7: Live Marketplace Feed (Infinite-scrolling real-time commercial posts)
  - Section 7.5: Upcoming Trade Shows & Exhibitions
  - Section 8: Premium Blue RFQ Banner
  - Section 9: Sticky Bottom Mobile Nav Bar (70px height, optimized for thumb reach)
* **Search / Filters:** Global header-based search, horizontal scrolling category filter chips.
* **Empty / Loading / Error States:** Feeds degrade gracefully to cached mock data if API limits are reached.

### 1.2 Search Results Screen (`/search`)
* **URL:** `/search?q=...`
* **Purpose:** Allows buyers to query companies, products, or exhibition booths.
* **Components Used:** `SearchView`, `MarketplaceShell`, `SearchBar`, `CompanyCard`, `ProductCard`.
* **Forms:** Header search form.
* **Empty States:** "No results found for your query. Try searching for regional products like Olive Oil, Dates, or Textiles."

### 1.3 Categories Directory (`/categories`)
* **URL:** `/categories`
* **Purpose:** Provides a full catalog index of industry groups.
* **Components Used:** `CategoriesListing`, `MarketplaceShell`.
* **Sections:** Grid cards representing sectors (Food & Agri, Textiles, Chemical, Mechanical, Handicrafts, Packaging, etc.).
* **Navigation:** Back button to Home, link to detail categories.

### 1.4 Category Detail Screen (`/categories/[slug]`)
* **URL:** `/categories/[slug]`
* **Purpose:** Showcases products and suppliers within a specific industry.
* **Components Used:** `CategoryDetails`, `MarketplaceShell`, `ProductCard`, `CompanyCard`.
* **Search / Filters:** Sorting dropdown (Featured, Price, MOQ, Rating).
* **Empty States:** Display empty catalog graphics when no active merchants exist.

### 1.5 Companies Listing Directory (`/companies`)
* **URL:** `/companies`
* **Purpose:** Standard buyer catalog of registered Tunisia-based manufacturers and trade agents.
* **Components Used:** `CompaniesListing`, `MarketplaceShell`, `CompanyCard`.
* **Search / Filters:** Filters by business type (Manufacturer, Wholesaler, Agent), location (Sfax, Tunis, Sousse).

### 1.6 Company Public Storefront Detail (`/companies/[slug]`)
* **URL:** `/companies/[slug]`
* **Purpose:** Premium B2B storefront representing the public face of the enterprise.
* **Components Used:** `CompanyDetails`, `MarketplaceShell`, `ProductCard`, `PostsFeed`.
* **Sections:**
  - Hero Cover Header with company brand logo.
  - Verifications Widget (Tax ID, RNE matching badge).
  - Business Meta Grid (Business Type, City, Est. Year).
  - Quick Contacts (WhatsApp Direct Click, Website URL, Phone Call).
  - Dedicated Segmented Panel: Products Catalogs, Daily Feed Updates, Reviews, Certificates.
  - Interactive "Request Quote" modal trigger.
* **Empty States:** Empty galleries or missing certificates are dynamically hidden to maintain professional storefront representation.

### 1.7 Public Products Directory (`/products`)
* **URL:** `/products`
* **Purpose:** Infinite scrolling grid of all listed products in the marketplace.
* **Components Used:** `ProductsListing`, `ProductCard`, `MarketplaceShell`.
* **Search / Filters:** Subcategory filter chips, Price and MOQ sliders.

### 1.8 Product Detail Page (`/products/[id]`)
* **URL:** `/products/[id]`
* **Purpose:** Single product listing details with heavy call-to-actions for direct conversion.
* **Components Used:** `ProductDetails`, `ProductGallery`, `MarketplaceShell`.
* **Sections:**
  - Photo Carousel with WebP loading support.
  - Specification Table (MOQ, Price range in TND, Origin City, Supply Capacity).
  - Description body.
  - Sticky mobile Action Panel: Click-to-WhatsApp (with prefilled message), Chat, Send RFQ Bidding.

### 1.9 Social Commercial Feed (`/discover`)
* **URL:** `/discover`
* **Purpose:** Dynamic, TikTok-style vertical social feed showcasing real-time posts from merchants.
* **Components Used:** `DiscoverFeed`, `MarketplaceShell`, `MobileBottomNav`.
* **Sections:** Vertical video/image viewport with action links: like, bookmark, comment, view company store.
* **Empty States:** Graceful fallback to default commercial posts.

---

## 2. Supplier & Merchant Portal (`/account`)

### 2.1 Supplier Interactive Workspace (`/account`)
* **URL:** `/account`
* **Purpose:** Multi-functional, progressive dashboard that dynamically adapts strictly based on the enterprise's database-assigned plan tier:
  - **Starter Tier (Level 1):** Omits deep analytics, certificates, catalog downloads, and multiple brand assets.
  - **Business Tier (Level 2):** Unlocks analytics dashboard preview, multi-photo catalog, and verification submission.
  - **Enterprise Tier (Level 3):** Adds production capacities, team administrator listings, and full exhibition application widgets.
* **Components Used:** `CompanyProfile`, `MerchantPosts`, `RfqDialog`.
* **Sections:**
  - Cover and brand image hero.
  - Interactive QR Code generator (draws direct scan canvas modal to share storefront URL).
  - Onboarding 3-step wizard (triggered automatically for newly registered suppliers).
  - Dynamic Tabs: About, Products Manager, My Posts, Exhibitions, Certificates, Analytics.
* **Forms:**
  - Onboarding form (Steps 1, 2, 3).
  - First product listing form.
  - Profile edit form.

---

## 3. Virtual Trade Exhibition Portal (`/exhibitions`)

### 3.1 Main Exhibitions Hall Directory (`/exhibitions`)
* **URL:** `/exhibitions`
* **Purpose:** Displays virtual tradeshow events scheduled on ALSOUK.
* **Components Used:** `LanguageProvider`, `SiteHeader`, `MobileBottomNav`.
* **Sections:**
  - Featured Trade Show Header.
  - Infinite-scrolling Event cards showing dates, location, active exhibitors count, and entering CTA.
* **Search / Filters:** Event status filtering (Live, Upcoming, Archived).

### 3.2 Single Exhibition Event Details (`/exhibitions/[slug]`)
* **URL:** `/exhibitions/[slug]`
* **Purpose:** Landing portal for a specific virtual trade show.
* **Components Used:** `LanguageProvider`, `ExhibitorDirectory`.
* **Sections:**
  - Event details banner.
  - Booth Category Filter Chips (Agriculture Booths, Industrial Tech, etc.).
  - Search bar to locate specific company booths.
  - Interactive Exhibitor Directory grid.
  - "Apply to Exhibit" Call-to-Action for companies.

### 3.3 Apply to Exhibit Onboarding Page (`/exhibitions/[slug]/apply`)
* **URL:** `/exhibitions/[slug]/apply`
* **Purpose:** Onboarding wizard to submit corporate registration to trade show organizers.
* **Components Used:** Exhibition Application Form.
* **Validation:** Mandatory company name, RNE tax identifier, category selection, contact email, and booth size requests.

### 3.4 Booth Virtual Directory Page (`/exhibitions/[slug]/booths/[id]`)
* **URL:** `/exhibitions/[slug]/booths/[id]`
* **Purpose:** The actual immersive booth layout mimicking physical exhibit presence.
* **Sections:**
  - Virtual Booth Banner & Brand Monogram.
  - Quick Action Row: Book Meeting, Bookmark Booth, Simulated QR Code, Private Visitor Notes.
  - Dedicated Booth Items Section (Displays custom *exhibits* representing prototypes or innovations rather than general marketplace catalog).
  - Multi-tab View: Showcase, Virtual Documents, Media Gallery, Contact Info.

### 3.5 Visitor Experience Workspace (`/exhibitions/visitor`)
* **URL:** `/exhibitions/visitor`
* **Purpose:** Personal hub for registered buyers/trade visitors.
* **Sections:**
  - Overview of virtual trade show activities.
  - **Favorites Tab:** Bookmarked virtual booths and products.
  - **History Tab:** List of booths visited.
  - **Notes Tab:** Editable private notes recorded per booth.
  - **Meetings Tab:** List of scheduled B2B trade meetings with status.

---

## 4. Exhibition Manager Workspace

### 4.1 Organizer Dashboard (`/exhibitions/organizer/dashboard`)
* **URL:** `/exhibitions/organizer/dashboard`
* **Purpose:** Control panel for trade show organizers.
* **Tabs & Sub-routes:**
  - **Overview Home (`/`):** Total booths, applications, scheduled B2B meetings, and registration charts.
  - **Applications Workspace (`/applications`):** Pending approvals, status reviewer modal, and automatic booth number generation.
  - **Booth Allocator (`/booths`):** Space layout settings, assigning physical floor spots.
  - **Configuration Editor (`/edit`):** Dates, banner layouts, logo assets, and legal descriptions.
  - **Statistics Overview (`/statistics`):** Interactive traffic charts.

### 4.2 Exhibitor Dashboard (`/exhibitions/booth/dashboard`)
* **URL:** `/exhibitions/booth/dashboard`
* **Purpose:** Gated management screen for approved companies representing their booth.
* **Lockout Mechanics:** Undergoes full field lockout and warning shield display if booth status is "Submitted" or "Under Review".
* **Sub-routes:**
  - **Main Overview (`/`):** View metrics (booth views, item interactions, document downloads).
  - **Edit Identity (`/edit`):** Upload booth-specific logo, banner, name, and descriptions.
  - **Exhibits Manager (`/exhibits`):** Add, modify, duplicate, or reorder (without drag) dedicated prototypes or services.
  - **Media & Documents (`/media`):** Upload PDF catalog guides and brochures.
  - **Live Preview (`/preview`):** Sandbox simulation matching the visitor viewport.

---

## 5. Administrative Portal (`/admin`)

* **Base Path:** `/admin`
* **Theme:** Separate Dark UI Shell.
* **Sub-routes:**
  - `/admin/` — Overview of system registrations.
  - `/admin/exhibitions` — Manage all trade events.
  - `/admin/exhibitions/new` — Setup next trade show.
  - `/admin/exhibitions/[id]` — Detailed trade show info.
  - `/admin/exhibitions/[id]/edit` — Edit trade show dates and logo metadata.
  - `/admin/applications` — System-wide company registration requests.
  - `/admin/booths` — Live list of virtual booths.
  - `/admin/rfqs` — Manage buyer bidding quotes.
  - `/admin/statistics` — System performance charts.
