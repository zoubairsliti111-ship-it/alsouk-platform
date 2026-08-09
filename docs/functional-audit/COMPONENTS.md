# ALSOUK — COMPONENTS FUNCTIONAL REVIEW

This document registers the functional and structural inventory of all shared React components under the `components/` directory tree.

---

## 1. Global Navigation & Layout Components

### 1.1 Site Header (`components/site-header.tsx`)
* **Purpose:** Handles multilingual selection, branding logo display, active navigation links, and the buyer's notification/profile shortcuts.
* **Layout Specifications:** Sticky top-bar layout (64px height) with full RTL text/alignment switching.
* **States:** Dynamic login status display (renders user monogram or a "Sign In" link).

### 1.2 Mobile Bottom Navigation (`components/mobile-bottom-nav.tsx`)
* **Purpose:** Provides instantaneous mobile bottom tap targets (70px height) following modern app layout standards.
* **Target Elements:** Exactly 5 tabs: Home, Discover (Social Feed), RFQ (Add Lead), Messages, Account (Supplier Dashboard).
* **Behavior:** Integrates with Next.js router to assign active CSS coloring to the matching current route.

### 1.3 Site Footer (`components/site-footer.tsx`)
* **Purpose:** Public informational bottom footer. Features links to Terms, Export Directories, and corporate coordinates. Hidden on custom dashboards to maximize space.

---

## 2. Homepage Sections (`components/home/`)

### 2.1 Search Bar (`components/home/search-bar.tsx`)
* **Purpose:** Premium styled central search box on the homepage. Includes fast-search suggestions.
* **Interactive Elements:** Text input field with instant search-as-you-type options for Tunisian search query terms.

### 2.2 Today's Opportunities (`components/home/opportunities.tsx`)
* **Purpose:** Displays live buyer request cards directly on the homepage. Emphasizes instant response rates and bidding counters.

### 2.3 Categories Grid (`components/categories-section.tsx`)
* **Purpose:** Renders the core 10 horizontal scrolling icons representing industrial branches (Agriculture, Textiles, Metals, Chemicals, Food Products, Handcrafts, etc.).
* **Layout:** Employs Tailwind `snap-x` and hidden scrollbar styles for clean mobile touch navigation.

### 2.4 Featured Suppliers (`components/featured-suppliers.tsx`)
* **Purpose:** Shows premium-badge verified suppliers with rating metrics, origin cities, and business types.

### 2.5 Featured Products (`components/featured-products.tsx`)
* **Purpose:** Grid displaying top-performing B2B product catalog cards. Includes prices and Minimum Order Quantity (MOQ) metrics.

### 2.6 Live Marketplace Feed (`components/home/live-marketplace.tsx`)
* **Purpose:** Infinite scrolling feed representing real-time updates from companies. Replaces legacy static elements with active, media-rich posts.

### 2.7 Trade Shows & Exhibitions Section (`components/home/exhibitions-section.tsx`)
* **Purpose:** Teaser list of active or upcoming trade shows. Direct entry link to `/exhibitions`.

---

## 3. Marketplace Specific Components (`components/marketplace/`)

### 3.1 Company Card (`components/marketplace/company-card.tsx`)
* **Purpose:** Standard summary block for a manufacturer. Renders logo, verification badge, and primary categories.

### 3.2 Product Card (`components/marketplace/product-card.tsx`)
* **Purpose:** catalog product block. Displays single photo with zoom, localized price estimation, and the Minimum Order Quantity (MOQ).

### 3.3 Company Details Storefront (`components/marketplace/company-details.tsx`)
* **Purpose:** The dynamic visual wrapper for public company profile pages. Omit empty layouts, displaying only validated, populated merchant assets.

### 3.4 Product Details Screen (`components/marketplace/product-details.tsx`)
* **Purpose:** Deep-dive product specification reader. Integrates the direct Call-to-Action panel (WhatsApp, internal chat, RFQ).

---

## 4. RFQ Bidding Components (`components/rfq/`)

### 4.1 RFQ Dialog (`components/rfq/rfq-dialog.tsx`)
* **Purpose:** Interactive overlay popup to quickly submit a Request for Quote without leaving the product or store view.
* **Forms Integrated:** Core RFQ fields (Quantity, Target price, Delivery terms).

---

## 5. AI Assistant Components (`components/ai/`)

### 5.1 Assistant Widget (`components/ai/assistant-widget.tsx`)
* **Purpose:** Floating chat bubble on the bottom-right corner. Invokes the server-side AI agent API to guide buyers and assist suppliers in drafting catalog listings or finding regional matches.
