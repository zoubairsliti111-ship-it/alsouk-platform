# ALSOUK — USER JOURNEYS SPECIFICATION (04_USER_JOURNEYS)

**Author:** Chief Product Officer & Lead UX Architect
**Status:** Approved Product Blueprint
**Target Audience:** Engineering, Design, QA, and Support Teams
**Document Scope:** Complete End-to-End User Experience Workflows

---

## 1. Merchant Journey (The Supplier Onboarding & Sales Loop)

This journey tracks the merchant's experience from initial registration to receiving their first sales lead on WhatsApp.

```
+------------+     +---------------+     +---------------+     +---------------+
| Phone Sign | --> | 3-Step Wizard | --> | First Product | --> | WhatsApp Lead |
|   Up (TND) |     |  (Company DB) |     | Quick Lister  |     |   Incoming    |
+------------+     +---------------+     +---------------+     +---------------+
```

### 1.1 Step-by-Step Flow
1.  **Registration:** The merchant (e.g., Chokri, Wholesaler) arrives at `/register` on mobile. They input their 8-digit Tunisian phone number and choose a password.
2.  **Role Selection:** Upon successful login, they are greeted by the "Who are you?" modal. They select "Supplier".
3.  **Step-by-Step Onboarding Wizard:**
    *   **Step 1:** Inputs company legal name, selects Business Type and Primary Industry, and enters City (Sfax, Sousse, Tunis, etc.).
    *   **Step 2:** Enters business phone, WhatsApp number (with 🇹🇳 logo and +216 static prefix), and social media links.
    *   **Step 3:** Provides a short description and pastes a logo URL.
4.  **Instant Storefront Generation:** The system automatically inserts a matching entry into `public.stores`.
5.  **First Product Quick Lister:** Upon completing the wizard, the system redirects the user to the "First Product" page with minimal fields: Name, Category, Price, MOQ, photo URL, and description.
6.  **Confirmation Screen:** The merchant completes product creation and sees the "✅ Your company is now online" page.
7.  **Active Sourcing Lead:** A buyer finds their product and taps the WhatsApp button. The merchant receives a direct message with product details.

### 1.2 Journey Diagnostics & Fail-Safes

*   **Pain Points:**
    *   Merchants might type their phone number with a leading zero or country code, causing validation errors.
    *   Forcing slug creation manually creates confusion.
*   **Expected Emotions:** Optimistic during registration, slightly anxious during step-by-step configuration, excited when receiving the "Your company is online" message.
*   **System Actions:**
    *   Transform the 8-digit phone number into a synthetic email (`phoneXXXXXXXX@alsouk.com`) before calling `supabase.auth.signUp()`.
    *   Extract the company name, convert it to a sanitized slug in the backend, and verify slug uniqueness.
    *   Automatically insert a default storefront row in `public.stores` linked to the newly created company.
*   **Success Conditions:**
    *   Company record successfully inserted in `public.companies`.
    *   Company owner registered in `public.company_members` as `role = 'owner'`.
    *   Default active store generated.
*   **Failure Conditions:**
    *   The phone registration fails because of a duplicate synthetic email.
    *   The company is created but the `company_members` join row fails, creating an orphaned company.
*   **Recovery Flow:**
    *   If a phone number is already registered, redirect the user to `/login` with an informative toast message.
    *   Wrap company and membership insertions in a clean service-level transaction wrapper (`createCompany()`). If either fails, rollback all modifications and display a clear, localized error banner.

---

## 2. Buyer Journey (Sourcing & RFQ Discovery)

This journey tracks how a local buyer (e.g., Leila, Retailer) searches for goods, browses feeds, and requests bulk pricing.

```
+------------+     +---------------+     +---------------+     +---------------+
| SOUKI Home | --> | Snapping Feed | --> | Product Specs | --> | Multi-Step    |
| Discover   |     | Vertical loop |     | View (TND)    |     | RFQ Request   |
+------------+     +---------------+     +---------------+     +---------------+
```

### 2.1 Step-by-Step Flow
1.  **SOUKI Feed Discovery:** Leila loads the ALSOUK home page on mobile. She scrolls past the scrolling categories and active opportunities.
2.  **Visual Snapping Feed:** She navigates to `/discover` and browses the TikTok-style vertical short video loop showcasing active factories and product operations.
3.  **Product Navigation:** Tap on a video tag links Leila directly to the detailed Product Specifications view (`/products/[id]`). She reviews the minimum order quantity (MOQ) and price (displayed in Tunisian Dinars with millimes formatting, e.g., `12.500 د.ت`).
4.  **Negotiation & Sourcing:**
    *   *Path A (Conversational):* She taps "Send Message on WhatsApp", launching WhatsApp with a pre-filled regional text.
    *   *Path B (Formal RFQ):* She taps "Request Bulk Quote", loading the multi-step RFQ builder.
5.  **RFQ Details Submission:**
    *   **Step 1:** Specify requested volume and target price.
    *   **Step 2:** Provide contact details (Name, Phone number).
6.  **Confirmation:** Leila submits the form and receives a confirmation screen.

### 2.2 Journey Diagnostics & Fail-Safes

*   **Pain Points:**
    *   Broken external image URLs or dead product videos cause blank cards.
    *   Static exchange rates can lead to pricing confusion.
*   **Expected Emotions:** Curious while browsing, satisfied with the clean visual feeds, reassured when accessing direct WhatsApp chat paths.
*   **System Actions:**
    *   Query product specifications using `formatPrice` to convert USD values to TND using the active exchange rate.
    *   Pre-populate the RFQ form fields if the buyer is authenticated.
    *   Insert the submitted RFQ into the `public.rfqs` table and set appropriate RLS policies.
*   **Success Conditions:**
    *   The RFQ row successfully links the buyer to either a legacy supplier or a modernized company.
    *   The database blocks public read access to the RFQ to protect buyer contact details (PII) from scrapers.
*   **Failure Conditions:**
    *   Guest users trigger multiple spam RFQs, overloading the table.
    *   The supplier's registered WhatsApp number is invalid or formatted incorrectly, breaking the mobile deep link.
*   **Recovery Flow:**
    *   Implement rate limiting on the RFQ submission route using standard Next.js API middleware.
    *   Fallback cleanly to a native in-app messages panel if the deep link to WhatsApp fails.

---

## 3. Admin Journey (Audit & Moderation)

This journey tracks how platform administrators (e.g., Youssef, Sourcing Controller) moderate profiles and coordinate buyer requests.

```
+------------+     +---------------+     +---------------+     +---------------+
| Admin Auth | --> | Sourcing Lead | --> | Audit & Trust | --> | Dispatch      |
| Dashboard  |     | Review Center |     | Verification  |     | Bid Offers    |
+------------+     +---------------+     +---------------+     +---------------+
```

### 3.1 Step-by-Step Flow
1.  **Administrative Login:** Youssef logs in using his verified administrator account.
2.  **Sourcing Review Panel:** He loads `/admin/rfqs` to review the queue of incoming B2B RFQs.
3.  **Spam Moderation:** He audits submitted RFQs for suspicious links or spam, filtering out low-quality requests.
4.  **Company Auditing:** Youssef navigates to the Pending Verification queue. He reviews a supplier's tax document and matches the tax ID (Matricule Fiscal) against the Tunisian National Registry of Enterprises (RNE).
5.  **Trust Assignment:** He approves the audit, changing the company's status to "Verified" and assigning a `verification_tier` badge.
6.  **RFQ Matching Dispatch:** He exports the high-volume RFQ as a matched lead alert, notifying relevant verified manufacturers in that category.

### 3.2 Journey Diagnostics & Fail-Safes

*   **Pain Points:**
    *   Reviewing hundreds of daily applications is tedious.
    *   Incomplete company documents slow down verification.
*   **Expected Emotions:** Focused, analytical, satisfied when weeding out low-quality submissions.
*   **System Actions:**
    *   Secure admin routes behind strict server-side authentication rules.
    *   Restrict write operations on `public.categories` and verification overrides to service-role clients.
*   **Success Conditions:**
    *   All admin modifications are logged with audit trails in the database.
    *   Company verification tiers are correctly indexed, instantly boosting their search ranking.
*   **Failure Conditions:**
    *   Unauthenticated users exploit public API endpoints to access protected RFQ lists.
*   **Recovery Flow:**
    *   Verify role access server-side in all Next.js page components before rendering admin views.
    *   Ensure the database uses strict Postgres Row-Level Security (RLS) policies that reject public read/write operations on admin endpoints.
