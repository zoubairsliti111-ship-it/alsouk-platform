# ALSOUK — FEATURE SPECIFICATIONS (07_FEATURE_SPECIFICATIONS)

**Author:** Chief Product Officer & Lead UX Architect
**Status:** Approved Product Blueprint
**Target Audience:** Frontend Developers, Backend Engineers, QA Leads, Product Managers
**Document Scope:** Detailed Functional Specifications for Every Platform Feature

---

## 1. Products Feature Set

### 1.1 Purpose
Allows suppliers to display their B2B catalog items, complete with bulk pricing, Minimum Order Quantities (MOQ), and structural attributes.

### 1.2 Business & UX Rules
*   **Decoupled Creation:** Products must be associated with both a Company and a Storefront.
*   **Currency Precision:** All database prices must support conversion to Tunisian Dinars (TND) with millimes precision (3 decimal places).
*   **No-Scrollbar Galleries:** Product details pages render catalog photos in a horizontal snapping carousel.

### 1.3 Validation Rules
*   **Price:** Must be a positive decimal number. Free/quote-based items must display "Contact for Price".
*   **MOQ:** Must be an integer greater than or equal to 1.
*   **Slug Uniqueness:** Product slugs must be unique within their parent storefront (`public.products.store_id`).

### 1.4 Acceptance Criteria
*   GIVEN an authenticated supplier on `/account`, WHEN they fill out the quick lister, THEN a product record is successfully inserted in `public.products`.
*   GIVEN a public buyer, WHEN they view a product, THEN they see the price formatted in TND with 3 decimal places and a WhatsApp CTA button.

---

## 2. Companies & Stores Feature Set

### 2.1 Purpose
Establish distinct corporate identities for merchants, decouple user accounts from business entities, and automatically generate virtual storefronts.

### 2.2 Business & UX Rules
*   **Multi-Member Access:** A company can be managed by multiple users, with roles defined in `public.company_members` (Owner, Editor).
*   **Automated Storefront Generation:** When a company is successfully created, the system must automatically insert a default active storefront in `public.stores` to prevent 404 preview errors.
*   **Defensive Profile Rendering:** On public company profiles, unpopulated sections (such as empty galleries or export targets) must be hidden to maintain a professional layout.

### 2.3 Validation & Future Expansion
*   **Tax Identifiers (Matricule Fiscal):** Must match Tunisian formats during verification audits.
*   **Future Expansion:** Integration with the Tunisian National Registry of Enterprises (RNE) API for real-time, automated verification checks.

---

## 3. Sourcing RFQ Engine

### 3.1 Purpose
Allows regional buyers to broadcast bulk sourcing requirements to verified suppliers.

### 3.2 Business & UX Rules
*   **Guest Access:** Guest buyers can submit RFQs without creating a password.
*   **Pre-population:** If a buyer is authenticated, their name, email, and phone number are automatically pre-filled in the form.
*   **Security & Privacy:** Submitted RFQs contain sensitive contact information (PII). To prevent scraping, public Row-Level Security (RLS) policies must block public read access to `public.rfqs`.

### 3.3 Validation Rules
*   **Quantity:** Must be greater than zero.
*   **Phone Number:** Must be a valid Tunisian 8-digit phone number.

### 3.4 Acceptance Criteria
*   GIVEN any buyer on `/rfq`, WHEN they submit an RFQ, THEN a row is inserted in `public.rfqs` and a success confirmation page is displayed.
*   GIVEN a public guest, WHEN they attempt to read the `/api/rfqs` endpoint, THEN the system returns an access denied error.

---

## 4. In-App Messaging & Conversational Chat

### 4.1 Purpose
Provide a secure, real-time communication channel for buyers and suppliers to negotiate terms directly within ALSOUK.

### 4.2 Business & UX Rules
*   **Conversational Commerce:** Chat threads should display product attachments and active RFQ cards.
*   **Real-time Delivery:** Messages are delivered instantly using real-time WebSockets or server-sent events.
*   **Mobile-optimized Keyboard:** The input field must remain pinned to the bottom of the viewport when the mobile keyboard is open.

### 4.3 Future Expansion & Dependencies
*   **Dependencies:** Requires the implementation of `public.conversations` and `public.messages` tables.
*   **Future Expansion:** Rich media uploads (photos, PDFs) and integration with WhatsApp Business API.

---

## 5. SOUKI Social Loop (Commercial Posts & Videos)

### 5.1 Purpose
Replace static listings with interactive social feeds, including short videos and daily stock updates.

### 5.2 Business & UX Rules
*   **Short Videos Feed (`/discover`):** TikTok-style vertical scrolling feed displaying 15-second looping videos with interactive product tags.
*   **Commercial Posts:** Short updates published by suppliers (e.g., "New shipment of fabrics arrived today!") that appear on buyers' feeds.

### 5.3 Validation Rules
*   **Video Format:** Loop must be optimized for mobile bandwidth (H.264/WebM, under 5MB).
*   **Character Limits:** Commercial posts are limited to 280 characters to keep updates quick and readable.

### 5.4 Acceptance Criteria
*   GIVEN a buyer in the `/discover` view, WHEN they swipe up, THEN the next looping video snaps into focus.
*   GIVEN an active video, WHEN they tap the product tag overlay, THEN they are redirected to the product details page.

---

## 6. SOUKI Search Engine

### 6.1 Purpose
Allows buyers to find relevant products, companies, and suppliers using simple search queries.

### 6.2 Business & UX Rules
*   **Unified Search:** Combines results from active products, storefront catalogs, and company profiles.
*   **City & Industry Filters:** Allows buyers to filter search results by location (Tunisian cities) and business type.

### 6.3 Future Expansion
*   **AI-Powered Semantic Search:** Combine PostgreSQL vector columns (`pgvector`) with OpenAI embeddings to support natural-language Tunisian Arabic queries (e.g., "Sourcing olive oil bottles in Sousse").

---

## 7. Notifications & Alerts

### 7.1 Purpose
Keep buyers and suppliers updated on message responses, RFQ matches, and verification status.

### 7.2 Business & UX Rules
*   **B2B Lead Alerts:** Suppliers receive instant notifications when an RFQ matching their category is submitted.
*   **Delivery Channels:** In-app notification center, with optional SMS and email alerts.

### 7.3 Dependencies
*   Requires a notification queue database table and integration with a local Tunisian SMS gateway for mobile alerts.

---

## 8. Sourcing Controller & Admin Panel

### 8.1 Purpose
Provides back-office moderation and verification tools for platform administrators.

### 8.2 Business & UX Rules
*   **Strict Security:** Admin routes are secured server-side; any unauthorized access is blocked.
*   **Verification Verification Panel:** Admins can view pending tax registration documents and assign verified badges.

### 8.3 Acceptance Criteria
*   GIVEN an admin on `/admin/rfqs`, WHEN they click "Approve", THEN the RFQ status is updated and matching suppliers are notified.
*   GIVEN an unauthenticated session, WHEN they attempt to access `/admin/rfqs`, THEN they are redirected to `/login`.
