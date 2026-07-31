# ALSOUK — SCREEN SPECIFICATIONS (06_SCREEN_SPECIFICATIONS)

**Author:** Chief Product Officer & Lead UX Architect
**Status:** Approved Product Blueprint
**Target Audience:** Frontend Developers, UI Designers, QA Engineers
**Document Scope:** Detailed Interface and State Specifications for Core Views

---

## 1. Homepage (`/`)

### 1.1 Purpose & Goals
*   **Purpose:** The central landing and discovery engine for ALSOUK.
*   **Primary Goal:** Guide buyers to supplier catalogs, opportunities, and the live marketplace feed.
*   **Secondary Goal:** Convert guest merchants into registered suppliers via subtle CTAs.

### 1.2 Layout & Component Specifications
The page follows a strict section sequence to optimize high-density mobile loading:
1.  **Sticky Header (64px):** Contains Logo, Language toggler, and Search Icon.
2.  **SOUKI Search Bar:** High-visibility, prominent search input field.
3.  **Today's Opportunities:** Real-time scrolling horizontal rail displaying active sourcing requests.
4.  **Categories Section:** A horizontal rail of exactly 10 round category icons (Tailwind `snap-x`, hiding scrollbars).
5.  **Featured Suppliers:** Showcase cards for verified regional manufacturers.
6.  **Featured Products:** High-density product cards showcasing local catalog items.
7.  **Live Marketplace:** A preview layout displaying active, real-time social streams.
8.  **RFQ Banner (Premium Blue):** High-impact CTA driving buyers to `/rfq`.
9.  **Mobile Bottom Navigation (70px):** Persistent navigational shortcut bar.

### 1.3 Inputs & Actions
*   **Inputs:** Main Search input (text).
*   **Actions:**
    *   Tap Category Icon -> Redirect to `/categories/[slug]`.
    *   Tap Product/Supplier Card -> Redirect to detailed profile view.
    *   Tap "Request Quote" Banner -> Redirect to `/rfq`.

### 1.4 State Handling
*   **Loading State:** Render CSS shimmer skeletons for categories and product cards.
*   **Empty State:** Show general fallback trending items if specific recommendations are empty.
*   **Error State:** Display a localized "No connection" toast banner if Supabase API calls fail.

### 1.5 Access & Navigation
*   **Permissions:** Publicly accessible (guest and authenticated).
*   **Navigation:** Deep links to products, companies, and category pages.

### 1.6 Future Improvements
*   Add live user counters (e.g., "🔥 12 buyers active now in Tunis") on category tags.

---

## 2. Login Page (`/login`)

### 2.1 Purpose & Goals
*   **Purpose:** Simple credentials entry designed for Tunisian phone users.
*   **Primary Goal:** Authenticate users securely and transition them to their dashboards.
*   **Secondary Goal:** Convert users to `/register` via a secondary outline CTA.

### 2.2 Layout & Component Specifications
*   **Layout:** Clean mobile card container centered with generous padding.
*   **Inputs:**
    *   **Phone Input:** Combines a Tunisian flag emoji (🇹🇳) and static prefix (+216) as a styled adornment. Enforces strict `maxLength={8}` and local 8-digit validations.
    *   **Password Input:** Secure text field with a togglable visibility icon (eye).
*   **Actions:**
    *   "Sign In" (Primary Solid Button) -> Authenticates user credentials.
    *   "Create Free Account" (Secondary Outline Button) -> Redirects to `/register` seamlessly.
    *   "Forgot Password?" (Text Link) -> Redirects to `/forgot-password`.

### 2.3 State Handling
*   **Loading State:** Button text changes to "Signing in...", spinner renders, form fields are disabled.
*   **Error State:** Renders inline error alerts (e.g., "Incorrect password", "Invalid phone number") with native RTL direction compatibility.

### 2.4 Access & Navigation
*   **Permissions:** Unauthenticated users only. Authenticated users are redirected to `/account`.
*   **Navigation:** Moves to `/account` upon successful session verification.

---

## 3. Account Dashboard (`/account`)

### 3.1 Purpose & Goals
*   **Purpose:** Unified supplier/buyer workspace.
*   **Primary Goal:** Allow suppliers to manage products, view RFQs, and respond to messages.
*   **Secondary Goal:** Prompt first-time users to select their roles and onboard their business.

### 3.2 Layout & Component Specifications
*   **Onboarding State:** If user metadata lacks a role, show the **"Who are you?" Role Selection Modal** with Buyer and Supplier options.
*   **Step-by-Step Wizard State:** If the supplier lacks a company, render the **3-Step Company Onboarding Wizard**:
    *   **Step 1:** Name, Classification, City.
    *   **Step 2:** Phone, WhatsApp (+216 prefix with 🇹🇳), Socials.
    *   **Step 3:** Bio & Logo URL.
*   **Main Dashboard State:** Displays the personal metadata header, a localized metrics summary (active products, RFQs, messages), and a tabbed navigation panel.

### 3.3 Inputs & Actions
*   **Actions:**
    *   Tap "Activate Advanced Tools" -> Unlocks and reveals advanced tabs (Themes, Export targets, Verification).
    *   Tap "Create Product" -> Opens the first product creation flow.
    *   Tap "Sign Out" -> Ends the session and redirects to `/`.

### 3.4 State Handling
*   **Loading State:** Render a full-page loading spinner during initial session validation.
*   **Empty State (Products):** Render a CTA button labeled "List Your First Product" with illustrative boxes.
*   **Error State:** Handle transaction rollback in `createCompany()`. If company insertion succeeds but membership fails, revert all modifications and display a clear error banner.

### 3.5 Access & Navigation
*   **Permissions:** Authenticated users only. Unauthenticated sessions redirect to `/login`.
*   **Future Improvements:** Persist active dashboard tab inside sessionStorage to prevent reset on browser reload.

---

## 4. Public Company Details (`/companies/[slug]`)

### 4.1 Purpose & Goals
*   **Purpose:** Publicly display verified business profiles to buyers.
*   **Primary Goal:** Drive buyer engagement via direct WhatsApp or chat CTAs.
*   **Secondary Goal:** Showcase business verification documents and export markets.

### 4.2 Layout & Component Specifications
*   **Layout:** Premium mobile-first details template.
*   **Components:**
    *   **Cover Banner & Logo:** High-impact brand header.
    *   **Verification Badge:** Prominent verified icon tied to their `verification_tier` DB enum.
    *   **Business Details Grid:** Displays City, Year Established, Business Type, and Primary Industry.
    *   **Digital Presence Links:** Facebook, TikTok, and external website links (rendered as custom inline SVGs).
    *   **Defensive Visibility Panels:** Empty galleries, certifications, and export markets are automatically hidden if unpopulated to maintain a clean public profile.

### 4.3 Inputs & Actions
*   **Actions:**
    *   "Message on WhatsApp" (Solid Green CTA) -> Opens WhatsApp deep link.
    *   "Request Bulk Quote" -> Opens `/rfq?company_id=...`.

### 4.4 State Handling
*   **Loading State:** Show CSS shimmering blocks for cover, logo, and text fields.
*   **Error State (404):** Render a clean, localized "Company not found" message with a CTA to return to `/companies`.

---

## 5. Discover Feed (`/discover`)

### 5.1 Purpose & Goals
*   **Purpose:** SOUKI social commerce video discovery feed.
*   **Primary Goal:** Provide buyers with a visual, interactive way to discover products.
*   **Secondary Goal:** Connect video viewers directly to supplier product listings.

### 5.2 Layout & Component Specifications
*   **Layout:** Full-viewport, snapping vertical feed (TikTok-style layout).
*   **Components:**
    *   **HTML5 Video Player:** Plays optimized looping video clips.
    *   **Product Link Overlay Card:** Displays a floating card over the video with the product photo, name, TND price, and a direct link to `/products/[id]`.
    *   **Supplier Overlay Badge:** Avatar and verified badge linking to the supplier's store.
    *   **Action Sidebar:** Floating quick-access buttons for WhatsApp sharing, saving, and contacting.

### 5.3 Inputs & Actions
*   **Actions:**
    *   Swipe Up/Down -> Snap to next/previous video.
    *   Tap Product Overlay Card -> Open `/products/[id]`.
    *   Tap WhatsApp Action -> Open WhatsApp deep link.

### 5.4 State Handling
*   **Loading State:** Render a spinning loader and show the video cover thumbnail until the media buffer is ready.
*   **Offline State:** Show a warning toast explaining that videos require an active network connection.

---

## 6. Sourcing RFQ Wizard (`/rfq`)

### 6.1 Purpose & Goals
*   **Purpose:** Sourcing request submission form for buyers.
*   **Primary Goal:** Capture detailed B2B sourcing requirements from buyers.
*   **Secondary Goal:** Pre-populate fields for registered users to minimize form friction.

### 6.2 Layout & Component Specifications
*   **Layout:** Progressive multi-step wizard form.
*   **Wizard Steps:**
    *   **Step 1 (Product Sourcing Requirements):** Select Category, input detailed requirements, specify Quantity and target Price (TND).
    *   **Step 2 (Buyer Contact Information):** Full Name, Phone number (enforced Tunisian 8-digit format), and email address.
*   **Actions:**
    *   "Next Step" / "Submit Sourcing Request" (Primary Button) -> Advances wizard or submits form.
    *   "Previous Step" -> Moves back to review previous inputs.

### 6.3 State Handling
*   **Loading State:** Submit button changes to "Submitting...", form inputs are disabled to prevent duplicate submissions.
*   **Validation States:** Native HTML5 and custom input validators verify that quantity is greater than zero and phone numbers are exactly 8 digits.

### 6.4 Access & Navigation
*   **Permissions:** Publicly accessible. Automatically imports active user profile parameters if authenticated.
*   **Future Improvements:** Add a success confetti effect to celebrate the buyer's submission.

---

## 7. Admin Sourcing Center (`/admin/rfqs`)

### 7.1 Purpose & Goals
*   **Purpose:** Back-office moderation panel for platform admins.
*   **Primary Goal:** Moderate, filter, and approve submitted buyer RFQs.
*   **Secondary Goal:** Audit pending companies and assign verification badges.

### 7.2 Layout & Component Specifications
*   **Layout:** Two-column desktop dashboard layout.
*   **Components:**
    *   **RFQs Table:** Lists all submitted RFQs, displaying Category, Quantity, Target Price, Buyer Phone, and Target Supplier.
    *   **Action Cell:** Action buttons to "Approve & Dispatch" or "Archive (Mark as Spam)".
    *   **Company Verification Panel:** Sidebar displaying uploaded merchant tax certificates and RNE registries.

### 7.3 State Handling
*   **Loading State:** Shimmering rows inside the table view.
*   **Empty State:** Localized message indicating "All RFQs moderated successfully."

### 7.4 Access & Navigation
*   **Permissions:** Restricted solely to authenticated users with `admin` metadata tags.
*   **Navigation:** Secured server-side via Next.js auth middleware.
