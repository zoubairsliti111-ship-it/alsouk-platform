# ALSOUK — PRODUCT VISION SPECIFICATION (01_PRODUCT_VISION)

**Author:** Chief Product Officer & Lead UX Architect
**Status:** Approved Product Blueprint
**Target Audience:** Engineering, Product, and Design Teams
**Document Scope:** Foundational Vision, Positioning, Business Model, and Success Metrics

---

## 1. Mission Statement
To empower North African and Tunisian merchants, manufacturers, and buyers by providing a modern, friction-free B2B social commerce platform that respects and elevates local relational trading practices, replacing rigid corporate interfaces with immediate, conversational, and visual connections.

## 2. Product Vision
To become the single, indispensable commercial engine of the North African B2B ecosystem. We envision a marketplace where any local workshop, agricultural cooperative, or importer can establish an online storefront in seconds from a mobile phone, and where regional sourcing agents can discover and negotiate with verified suppliers with the ease of browsing social media.

---

## 3. Core Values

1. **Local-First Empathy (SOUKI Center):** We design for the reality of the Tunisian and North African merchant. This means designing for mobile-first viewports (390px reference), supporting colloquial multi-lingual terms (Arabic, French, English), using local currency structures (Tunisian Dinars with millimes formatting), and prioritizing instant conversation over rigid shopping carts.
2. **Setup Friction Elimination:** We reject long onboarding procedures. If a merchant has to wait days or fill out extensive legal documents just to display their products, the platform has failed. Registration, company creation, and product listing must be complete within minutes.
3. **Implicit Trust and High Visibility:** In regional commerce, trust is relational, not purely digital. We build trust by providing extensible verification tiers (e.g. verified badges, Tunisian National Registry of Enterprises (RNE) tax-id validations) and allowing suppliers to showcase their operations through rich media (videos, certificates, factory tours).
4. **Conversational Negotiation:** B2B transaction details (logistics, bulk discounts, custom terms) cannot be boxed into standard checkouts. We elevate WhatsApp and direct chat as primary checkout mediums, integrating them seamlessly into the core user journey.

---

## 4. Target Market

The primary target market is the B2B trading community in **Tunisia and North Africa (Algeria, Libya, Morocco)**, categorized into specific active segments:

*   **Suppliers (The Sellers):**
    *   **Manufacturers & Artisans:** Local workshops, textile factories, olive oil mills, and plastic molding facilities looking to export or supply large wholesalers.
    *   **Wholesalers & Importers:** High-volume distributors in commercial districts (e.g., Rue d'Espagne in Tunis, Sfax, Sousse) supplying regional retailers.
    *   **Exporters:** Agricultural cooperatives and industrial companies seeking cross-border B2B distribution into Europe and Africa.
*   **Buyers (The Sourcing Agents):**
    *   **Retailers & Shop Owners:** Local grocers, boutique owners, and hardware stores sourcing bulk merchandise.
    *   **Procurement Managers:** Institutional and enterprise buyers seeking specialized manufacturing or agricultural supply.
    *   **Cross-Border Traders:** Regional sourcing agents from Algeria and Libya looking for high-quality Tunisian manufactured products.

---

## 5. Business Model

ALSOUK operates a highly scalable **B2B Freemium & SaaS** model customized for the regional ecosystem, completely avoiding transaction fees to maximize trust:

```
+-------------------------------------------------------------------+
|                           FREE TIER                               |
| Basic Storefront, 10 Product Listings, Unlimited WhatsApp Clicks  |
+---------------------------------+---------------------------------+
                                  | Upgrade path
                                  v
+---------------------------------+---------------------------------+
|                         PREMIUM TOOLS                             |
| - Storefront Themes & Custom Styling                              |
| - Infinite Product Catalog space                                  |
| - Detailed Analytics Dashboard (Views, Leads, Reach)              |
+---------------------------------+---------------------------------+
                                  | Upgrade path
                                  v
+---------------------------------+---------------------------------+
|                     VERIFICATION TIERS (RNE)                      |
| - "Verified Supplier" Badge (Automatic RNE Registry Validation)  |
| - Priority Placement in Search and SOUKI Home Feed                |
| - Direct verification documents upload (ISO, Tax Registration)    |
+---------------------------------+---------------------------------+
                                  | Upgrade path
                                  v
+---------------------------------+---------------------------------+
|                    LEAD GENERATION (RFQ ACCELERATOR)              |
| - Unlock premium buyer RFQs instantly                             |
| - Direct bidding access for specific manufacturing opportunities   |
+-------------------------------------------------------------------+
```

1. **Free Tier (The Acquisition Loop):** Every merchant can sign up with a phone number, create their company profile, list up to 10 products, and receive direct WhatsApp leads completely free of charge. This eliminates the adoption barrier.
2. **Premium Advanced Tools Subscriptions:** Active suppliers pay a monthly/annual subscription to unlock advanced tools:
    *   Custom storefront layouts, banners, and personalized section orders.
    *   Unlimited product catalog listings.
    *   Advanced digital presence (integrated external links, multi-language translation management).
3. **B2B Trust and Verification Tiers:** A paid verification program where ALSOUK manually audits corporate documents (RNE registration, tax ID) to grant the premium **"Verified Supplier" Badge**, which instantly boosts matching search visibility and discoverability by 3x.
4. **RFQ Lead Accelerator (Bidding Tokens):** While suppliers can view public sourcing opportunities, premium matching RFQs require subscription tiers or "Bidding Tokens" to unlock direct contact details of high-volume international sourcing buyers.

---

## 6. Product Positioning

ALSOUK is uniquely positioned as a **Modern B2B Social Commerce Marketplace**, occupying a distinct quadrant compared to competitive alternatives:

| Attribute | Traditional B2B Directories (e.g., Alibaba) | ERP & Corporate Portals | Social Media (e.g., FB Groups) | ALSOUK (SOUKI) |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Interaction** | Dense tabular lists, long emails | Secure, rigid purchase forms | Chaotic posts, comments spam | **Visual scrolling, instant WhatsApp/Chat** |
| **Device Focus** | Desktop-first, complex | Desktop-only | Mobile-first but unstructured | **Mobile-First (390px optimized UI)** |
| **Onboarding Time** | Days (approval hurdles) | Weeks (integration) | Minutes (unverified) | **Under 3 Minutes (Seamless Phone Auth)** |
| **Trust Model** | Expensive Escrows | Strict Legal Contracts | Zero Verification (high risk) | **Hybrid (RNE validation + Verified Badges)** |
| **Local Currency** | USD only, credit cards | Multi-currency invoices | Raw bargaining | **TND (millimes format) & regional currencies** |

---

## 7. Competitive Advantage

Our competitive advantage stems from five structural pillars embedded directly within our technical and product architecture:

1. **Friction-Free Tunisian Phone-First Auth:** Standard platforms demand email authentication, which fails in Tunisia where merchants rely heavily on phone numbers. We use a **synthetic email translation layer** (`phoneToSyntheticEmail`) on top of Supabase Auth, allowing instant 8-digit Tunisian phone number registrations without friction.
2. **Tunisian Dinar Millimes Precision:** Database structures store base USD pricing but render native **TND prices to 3 decimal places (millimes)** through `formatPrice` using an exchange rate of 3.1. This mirrors how local transactions are recorded.
3. **The SOUKI Social Loop (Videos & Live Feed):** Rather than standard text pages, we implement a dynamic, snapped **Discover vertical video feed** (TikTok-style) and commercial posts that mimic the visual discovery habits of local buyers.
4. **Decoupled Company-Member Security:** Unlike platforms that lock a storefront to a single user account, ALSOUK separates owners from business entities via `company_members` join tables, allowing a workshop owner to delegate catalog maintenance to their sales employees without sharing credentials.
5. **No-Scrollbar Horizontal Snapping:** Tailored specifically for high-density mobile screens with Tailwind snapping layouts (`snap-x`, `no-scrollbar`), allowing rapid single-hand catalog exploration.

---

## 8. Long-Term Vision

*   **Phase 1-3:** Build a massive catalog of Tunisian suppliers and automate lead matching via public RFQs.
*   **Phase 4-5:** Launch native, high-performance in-app chat with real-time WebSockets and roll out user-generated short videos displaying live manufacturing workshops.
*   **Phase 6-8:** Introduce AI Sourcing Copilots, and expand transactions to support Algerian, Libyan, and cross-border North African maritime and land logistics.

---

## 9. Key Success Metrics (KPIs)

To guide engineering and product teams, our success is measured by the following metrics:

| Metric Name | Calculation Method | Target Threshold (30-day baseline) |
| :--- | :--- | :--- |
| **Merchant Acquisition Speed** | Time from `/register` load to first product creation screen. | `< 180 seconds` |
| **WhatsApp Connection Rate** | Clicks on the WhatsApp CTA button per product details pageview. | `> 18%` of unique page visitors |
| **SOUKI Home Feed Retention** | Average daily screen-time on `discover/` vertical video reels. | `> 5.5 minutes` per session |
| **Profile Completion Rate** | Dynamic score evaluated in `calculateProfileCompletion` service. | Average of `> 75%` for registered companies |
| **RFQ Match Speed** | Hours from RFQ submission to first supplier bidding lead response. | `< 4 hours` |
| **Multi-Language Adoption** | Daily active usage split between AR, FR, and EN views. | `ar: 40%`, `fr: 50%`, `en: 10%` |
