# ALSOUK — BUTTONS INVENTORY & STATUS

This document contains a complete, verified, and exhaustive button-by-button catalog across the ALSOUK B2B Platform.

---

## 1. Global Navigation & Layout Buttons

### 1.1 Language Switcher Button
* **Label:** "Switch Language" (displays current language, e.g., "AR / ARABIC" or "FR / FRANÇAIS")
* **Location:** Header Bar (`components/site-header.tsx`)
* **Expected Behavior:** Toggles a dropdown overlay listing available languages.
* **Actual Behavior:** Smoothly transitions direction (`dir="rtl"` vs. `dir="ltr"`) and updates standard terms.
* **Destination:** In-place state change.
* **API Call:** None.
* **Database / Supabase Interaction:** Updates user preferences state.
* **Authentication Required:** No.
* **Current Status:** ✅ Working

### 1.2 Sign In Button
* **Label:** "Sign In" / "Log In"
* **Location:** Header Bar (`components/site-header.tsx`)
* **Expected Behavior:** Redirects the buyer/seller to the login portal.
* **Actual Behavior:** Navigates instantly to `/login`.
* **Destination:** `/login`
* **API Call:** None.
* **Database / Supabase Interaction:** None.
* **Authentication Required:** No.
* **Current Status:** ✅ Working

### 1.3 Bottom Nav: Home
* **Label:** "Home"
* **Location:** Sticky Bottom Nav Bar (`components/mobile-bottom-nav.tsx`)
* **Expected Behavior:** Navigates to main marketplace landing page.
* **Actual Behavior:** Smooth instant transition.
* **Destination:** `/`
* **API Call:** None.
* **Database / Supabase Interaction:** None.
* **Authentication Required:** No.
* **Current Status:** ✅ Working

### 1.4 Bottom Nav: Discover
* **Label:** "Discover"
* **Location:** Sticky Bottom Nav Bar (`components/mobile-bottom-nav.tsx`)
* **Expected Behavior:** Redirects to the commercial updates vertical feed.
* **Actual Behavior:** Loads vertical feed viewer.
* **Destination:** `/discover`
* **API Call:** None.
* **Database / Supabase Interaction:** Fetches posts list.
* **Authentication Required:** No.
* **Current Status:** ✅ Working

### 1.5 Bottom Nav: RFQ
* **Label:** "Post RFQ"
* **Location:** Sticky Bottom Nav Bar (`components/mobile-bottom-nav.tsx`)
* **Expected Behavior:** Launches the central Request for Quote creation wizard.
* **Actual Behavior:** Opens the RFQ wizard layout.
* **Destination:** `/rfq`
* **API Call:** None.
* **Database / Supabase Interaction:** None.
* **Authentication Required:** No.
* **Current Status:** ✅ Working

---

## 2. Homepage Interactive Buttons

### 2.1 Search Dispatch Button
* **Label:** "Search"
* **Location:** Central Hero Search (`components/home/search-bar.tsx`)
* **Expected Behavior:** Captures input term and executes directory query.
* **Actual Behavior:** Directs router to search view with query params.
* **Destination:** `/search?q=...`
* **API Call:** `/api/search`
* **Database / Supabase Interaction:** Queries `public.companies` and `public.products` tables.
* **Authentication Required:** No.
* **Current Status:** ✅ Working

### 2.2 RFQ Quick Launch Button
* **Label:** "Request Quote"
* **Location:** Category listings & Floating buttons
* **Expected Behavior:** Displays immediate RFQ bidding popup overlay.
* **Actual Behavior:** Triggers standard Shadcn dialog overlay containing the RFQ form.
* **Destination:** Interactive Dialog Modal.
* **API Call:** None (until form submission).
* **Database / Supabase Interaction:** None.
* **Authentication Required:** No.
* **Current Status:** ✅ Working

### 2.3 AI Assistant Bubble
* **Label:** "AI B2B Sourcing" (Icon)
* **Location:** Floating Bottom Right (`components/ai/assistant-widget.tsx`)
* **Expected Behavior:** Opens the slide-up chat assistant container.
* **Actual Behavior:** Slides up the interactive AI messenger panel.
* **Destination:** Interactive Overlay.
* **API Call:** `/api/ai`
* **Database / Supabase Interaction:** None.
* **Authentication Required:** No.
* **Current Status:** ✅ Working

---

## 3. Account & Merchant Workspace Buttons

### 3.1 Onboarding Wizard Next Step Button
* **Label:** "Next" / "Suivant" / "التالي"
* **Location:** Account page onboarding block (`app/account/page.tsx`)
* **Expected Behavior:** Validates current step inputs and transitions to the subsequent screen.
* **Actual Behavior:** Smooth step transitions with active field validations.
* **Destination:** Step 1 -> Step 2 -> Step 3.
* **API Call:** None.
* **Database / Supabase Interaction:** None.
* **Authentication Required:** Yes.
* **Current Status:** ✅ Working

### 3.2 Onboarding Wizard Complete Button
* **Label:** "Finish Onboarding"
* **Location:** Onboarding Step 3 (`app/account/page.tsx`)
* **Expected Behavior:** Saves onboarding dataset to database and transitions to first product creation flow.
* **Actual Behavior:** Writes database company record and displays product creation wizard.
* **Destination:** First product creation flow inside workspace.
* **API Call:** POST `/api/companies`
* **Database / Supabase Interaction:** Inserts record into `public.companies` and executes `companies_enroll_owner` trigger to insert membership row.
* **Authentication Required:** Yes.
* **Current Status:** ✅ Working

### 3.3 Create Product Button
* **Label:** "Add First Product" / "Publish Catalog"
* **Location:** Product Wizard screen (`app/account/page.tsx`)
* **Expected Behavior:** Saves catalog item and redirects to the confirmation page.
* **Actual Behavior:** Saves the item and launches the "✅ Your company is now online" screen.
* **Destination:** Storefront Confirmation Screen.
* **API Call:** POST `/api/products`
* **Database / Supabase Interaction:** Writes product specifications to `public.products` and references `public.companies(id)`.
* **Authentication Required:** Yes.
* **Current Status:** ✅ Working

### 3.4 QR Code Action Button
* **Label:** "Generate QR Code"
* **Location:** Quick-action bar inside profile header (`app/account/page.tsx`)
* **Expected Behavior:** Spawns an HTML5 canvas overlay representing a QR code leading to the merchant's public store URL.
* **Actual Behavior:** Instantly renders the QR canvas inside a premium modal with download capabilities.
* **Destination:** QR Code Dialog Modal.
* **API Call:** None.
* **Database / Supabase Interaction:** None.
* **Authentication Required:** Yes.
* **Current Status:** ✅ Working

---

## 4. Virtual Trade Exhibition Buttons

### 4.1 Schedule B2B Trade Meeting
* **Label:** "Schedule Meeting" / "Prendre RDV"
* **Location:** Virtual Booth Space View (`app/exhibitions/[slug]/booths/[id]/page.tsx`)
* **Expected Behavior:** Opens the scheduled meeting request overlay popup.
* **Actual Behavior:** Triggers a modal with date selection, contact coordinates, and notes.
* **Destination:** scheduled Meeting Modal.
* **API Call:** POST `/api/exhibitions/meetings`
* **Database / Supabase Interaction:** Inserts scheduled B2B lead into `public.exhibition_meetings` table.
* **Authentication Required:** No (supports guest contact entries).
* **Current Status:** ✅ Working

### 4.2 Bookmark Booth Toggler
* **Label:** "Bookmark Booth" (and heart icon)
* **Location:** Virtual Booth Space View (`app/exhibitions/[slug]/booths/[id]/page.tsx`)
* **Expected Behavior:** Saves the booth profile to the user's personal favorites space.
* **Actual Behavior:** Toggles active heart styling and writes local visitor records.
* **Destination:** In-place update.
* **API Call:** POST `/api/exhibitions/visitor/favorites`
* **Database / Supabase Interaction:** Inserts or removes row from `public.exhibition_favorites` table.
* **Authentication Required:** No (galls back to localStorage).
* **Current Status:** ✅ Working

### 4.3 Save Private Notes Button
* **Label:** "Save Notes"
* **Location:** Visitor Notes Drawer (`app/exhibitions/[slug]/booths/[id]/page.tsx`)
* **Expected Behavior:** Persists the buyer's private remarks regarding this specific exhibitor.
* **Actual Behavior:** Saves details to DB and displays confirmation tick.
* **Destination:** Drawer interface.
* **API Call:** POST `/api/exhibitions/visitor/notes`
* **Database / Supabase Interaction:** Updates `public.exhibition_notes` table.
* **Authentication Required:** No (stores in local storage fallback).
* **Current Status:** ✅ Working

### 4.4 Submit Booth for Review
* **Label:** "Submit for Review"
* **Location:** Exhibitor Booth Dashboard (`app/exhibitions/booth/dashboard/page.tsx`)
* **Expected Behavior:** Locks out editing fields and transitions booth status to "Submitted".
* **Actual Behavior:** Renders warning shield overlay and disables input forms.
* **Destination:** In-place state reload.
* **API Call:** PUT `/api/exhibitions/booth`
* **Database / Supabase Interaction:** Updates `public.exhibition_booths` status column.
* **Authentication Required:** Yes.
* **Current Status:** ✅ Working

---

## 5. Central Admin Portal Buttons

### 5.1 Approve Registration Application
* **Label:** "Approve Application"
* **Location:** Admin review portal (`app/exhibitions/admin/applications/[id]/page.tsx`)
* **Expected Behavior:** Approves company trade show registration and auto-provisions a blank draft booth.
* **Actual Behavior:** Updates application status to "Approved" and inserts a blank booth into the DB.
* **Destination:** Redirects to the application list.
* **API Call:** POST `/api/exhibitions/applications/[id]` (or PUT `/api/admin/applications/[id]`)
* **Database / Supabase Interaction:** Updates status in `public.exhibition_applications` and inserts row into `public.exhibition_booths`.
* **Authentication Required:** Yes (Administrative).
* **Current Status:** ✅ Working
