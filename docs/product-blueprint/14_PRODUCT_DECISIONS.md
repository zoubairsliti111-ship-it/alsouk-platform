# ALSOUK — ARCHITECTURAL PRODUCT DECISIONS (14_PRODUCT_DECISIONS)

**Author:** Chief Product Officer & Lead UX Architect
**Status:** Approved Product Blueprint
**Target Audience:** Core Architecture Group, Future Engineering Leads
**Document Scope:** Key Product Decisions, Architectural Trade-Offs, and Technical Justifications

---

## 1. SOUKI Philosophy vs. Standard E-Commerce Checkouts

### 1.1 Problem
Traditional B2B and B2C marketplaces force users through rigid, automated "Add to Cart" and digital payment flows. In Tunisian and North African markets, transaction parameters (pricing, logistics, credit terms, and custom dimensions) are fluid, and trust is built conversationally.

### 1.2 Options Considered
*   **Option A:** Build a complete automated checkout system with digital payments and shipping calculators.
*   **Option B:** Provide a direct "Send Message on WhatsApp" CTA alongside a formal, multi-step RFQ submission engine (SOUKI model).

### 1.3 Decision
**Option B (SOUKI Model).** WhatsApp and structured RFQs are prioritized as the core transactional pathways of the platform.

### 1.4 Reasoning
This approach respects how regional merchants already trade, drastically reducing friction. By allowing buyers to contact suppliers on WhatsApp, we bypass the need for digital payment setups (which suffer from regulatory and adoption barriers in North Africa) and enable immediate, direct negotiations.

### 1.5 Trade-offs & Long-Term Impact
*   **Trade-off:** We lose direct transaction tracking, making traditional GMV calculations and transactional fee models impossible.
*   **Long-term Impact:** Rapid user acquisition and high engagement. Platform monetization can be driven by high-value B2B SaaS features (such as verification tiers and premium RFQ bidding) rather than transactional fees.

---

## 2. Decoupled Company-Member Join-Table Architecture

### 2.1 Problem
Traditional directories bind a supplier profile directly to a single user account. This prevents collaborative B2B operations where multiple sales assistants or warehouse managers need to manage a single catalog under a company brand.

### 2.2 Options Considered
*   **Option A (Single-Owner):** Store company details directly inside the user profile table.
*   **Option B (Decoupled):** Create separate `companies` and `company_members` tables, decoupling user sessions from corporate identities.

### 2.3 Decision
**Option B (Decoupled Model).**

### 2.4 Reasoning
Decoupling users from business profiles enables enterprise scenarios from day one. A company owner can onboard their business and easily delegate catalog editing to their sales assistants (`role = 'editor'`) without sharing passwords, and revoke access at any time.

### 2.5 Trade-offs & Long-Term Impact
*   **Trade-off:** Increased query complexity on dashboards, requiring multiple join lookups to verify access permissions.
*   **Long-term Impact:** Scalable B2B platform design that can grow to accommodate large distributors, agricultural cooperatives, and multi-national teams.

---

## 3. Phone-First Auth with Synthetic Email conversions

### 3.1 Problem
Tunisian merchants do not use email for daily operations, and standard email registration is a barrier to entry. However, standard authentication frameworks (such as Supabase Auth) are designed around email credentials by default.

### 3.2 Options Considered
*   **Option A:** Force standard email registration.
*   **Option B:** Integrate a dedicated, expensive regional SMS gateway from day one.
*   **Option C:** Convert phone inputs to client-side synthetic email addresses (`phoneToSyntheticEmail`) using password authentication directly on Supabase.

### 3.3 Decision
**Option C (Synthetic Emails).**

### 3.4 Reasoning
This allows us to support phone-first registration immediately without incurring the upfront development time and transaction costs of SMS gateways. By translating phone numbers to synthetic email addresses under the hood (e.g., `phone98765432@alsouk.com`), we satisfy standard Supabase auth requirements while keeping the frontend simple and familiar for local merchants.

### 3.5 Trade-offs & Long-Term Impact
*   **Trade-off:** If a client bypasses the translation function, raw values could corrupt the database. Password recovery is limited to client-side email resets, which Tunisian phone-only users cannot access.
*   **Long-term Impact:** An SMS OTP gateway can be added in Phase 8 without changing the underlying auth database schema, as synthetic emails map cleanly to active phone records.

---

## 4. Tunisian Dinar Price Formatting (Millimes Precision)

### 4.1 Problem
Most e-commerce systems store pricing with 2 decimal places (cents). The Tunisian Dinar (TND) uses **3 decimal places (millimes)**. Storing prices with standard 2-decimal formatting causes financial drift and currency formatting errors.

### 4.2 Options Considered
*   **Option A:** Store all database values as base USD and format them with 3 decimals on the client.
*   **Option B:** Convert base prices in the database to 3-decimal TND representations, storing values as floating-point numbers.

### 4.3 Decision
**Option A (Base USD storage with client-side 3-decimal TND formatting).**

### 4.4 Reasoning
By keeping database prices standard (base USD), we maintain international trade compatibility and simplify multi-currency conversions for export markets (Algeria, Europe). The client-side utility `formatPrice` converts USD values to TND dynamically using a 3.1 exchange factor, rendering the currency properly with 3 decimals (millimes).

### 4.5 Trade-offs & Long-Term Impact
*   **Trade-off:** Hardcoding the 3.1 exchange rate factor inside `formatPrice` can lead to financial drift if market rates fluctuate.
*   **Long-term Impact:** The static factor must be migrated to a dynamic, database-driven config table in Release 5 to support real-time exchange rate updates.

---

## 5. Defensive Server/Client Fallbacks

### 5.1 Problem
Missing environment keys during static site generation (SSG) or on local development setups can cause fatal compile-time failures, blocking production builds.

### 5.2 Options Considered
*   **Option A:** Crash the application if environment keys are missing.
*   **Option B:** Implement defensive fallback client builders that return mock clients when environment variables are unconfigured.

### 5.3 Decision
**Option B (Defensive Fallbacks).**

### 5.4 Reasoning
This ensures that Next.js production compilations (`npm run build`) can build successfully on server environments even if keys are missing. It also allows developers to run and test local visual layouts without requiring access to active database credentials.

### 5.5 Trade-offs & Long-Term Impact
*   **Trade-off:** Developers might not immediately notice if environment keys are missing locally until they attempt to execute database queries.
*   **Long-term Impact:** Bulletproof build stability on continuous integration (CI/CD) pipelines and hosting platforms like Vercel.
