# ALSOUK — FORMS INVENTORY & VALIDATION AUDIT

This file documents all form interfaces found throughout the ALSOUK B2B Platform, outlining fields, inputs, validations, and storage parameters.

---

## 1. User Access & Onboarding Forms

### 1.1 Login Form
* **Path:** `/login`
* **Purpose:** Authenticates buyers, sellers, and platform administrators.
* **Fields:**
  - `email` (Type: email, Mandatory: Yes)
  - `password` (Type: password, Mandatory: Yes)
* **Client-side Validation:** Checks format compliance and password lengths.
* **Submission Action:** Invokes Supabase authentication service.
* **Supabase Tables Involved:** standard `auth.users` authentication schema.
* **Storage Uploads:** None.
* **Current Status:** ✅ Working

### 1.2 Onboarding Form (3-Step Wizard)
* **Path:** `/account` (triggered for new merchants)
* **Purpose:** Creates the core company profile to launch digital storefront presence.
* **Fields:**
  - **Step 1:** `companyName` (text, required), `businessType` (select, required), `city` (select, required)
  - **Step 2:** `phone` (tel, required), `whatsApp` (tel, optional), `socialLinks` (JSON, optional)
  - **Step 3:** `description` (textarea, required), `logoUrl` (text/url, optional)
* **Client-side Validation:** Formats phone prefixes (+216), checks name string limits.
* **Submission Action:** POST request to company endpoint.
* **Supabase Tables Involved:** `public.companies` (writes base company row), `public.company_members` (creates membership).
* **Storage Uploads:** Supports direct asset upload.
* **Current Status:** ✅ Working

---

## 2. Catalog & Trade Forms

### 2.1 Product Creation Form
* **Path:** `/account` (under products manager segment)
* **Purpose:** Adds B2B catalog items to storefront display.
* **Fields:**
  - `name` (text, required)
  - `category` (select/dropdown, required)
  - `price` (numeric/range, optional)
  - `moq` (numeric/integer, required)
  - `photos` (file array, optional)
  - `description` (textarea, required)
* **Client-side Validation:** Ensures `moq` >= 1, enforces description lengths.
* **Submission Action:** POST request to product dispatcher.
* **Supabase Tables Involved:** `public.products`, `public.product_images`.
* **Storage Uploads:** Uploads product images to the products asset bucket.
* **Current Status:** ✅ Working

### 2.2 RFQ Request Form
* **Path:** `/rfq` (and Floating Modal)
* **Purpose:** Standard buyer bidding quote dispatcher.
* **Fields:**
  - `company_name` (text, required)
  - `contact_person` (text, required)
  - `email` (email, required)
  - `phone` (tel, required)
  - `product_requested` (text, required)
  - `quantity` (text, required)
  - `target_price` (text, optional)
  - `delivery_destination` (text, required)
  - `message` (textarea, required)
* **Client-side Validation:** Verifies email formats and ensures requested quantities are provided.
* **Submission Action:** Writes RFQ entry directly to database.
* **Supabase Tables Involved:** `public.rfqs`.
* **Storage Uploads:** None.
* **Current Status:** ✅ Working

---

## 3. Trade Show & Exhibition Forms

### 3.1 Exhibition Registration Application Form
* **Path:** `/exhibitions/[slug]/apply`
* **Purpose:** Allows merchants to request exhibition booth spots.
* **Fields:**
  - `company_name` (text, required)
  - `rne_tax_id` (text, required)
  - `category` (select, required)
  - `contact_email` (email, required)
  - `requested_booth_size` (select, required)
* **Client-side Validation:** Standard tax identifier checking and category selection.
* **Submission Action:** Submits application to review board.
* **Supabase Tables Involved:** `public.exhibition_applications`.
* **Storage Uploads:** None.
* **Current Status:** ✅ Working

### 3.2 Booth Visual Editor Form
* **Path:** `/exhibitions/booth/dashboard/edit`
* **Purpose:** Lets approved exhibitors update virtual tradeshow identity.
* **Fields:**
  - `booth_name` (text, required)
  - `booth_description` (textarea, required)
  - `logo_url` (text/url, optional)
  - `banner_url` (text/url, optional)
  - `contact_phone` (tel, optional)
* **Client-side Validation:** Enforces character limit on description.
* **Lockout Condition:** Locked and field disabled if booth status is "Submitted".
* **Submission Action:** Updates booth row.
* **Supabase Tables Involved:** `public.exhibition_booths`.
* **Storage Uploads:** Uploads to the exhibition booth storage bucket.
* **Current Status:** ✅ Working

### 3.3 Exhibits Workspace Form
* **Path:** `/exhibitions/booth/dashboard/exhibits/new` (or `/edit`)
* **Purpose:** Creates virtual exhibit prototypes (machines, innovations, services).
* **Fields:**
  - `name` (text, required)
  - `short_description` (text, required)
  - `description` (textarea, required)
  - `category` (select, required)
  - `images` (file/url list, optional)
* **Client-side Validation:** Enforces short description limits.
* **Lockout Condition:** Locked and disabled if booth status is "Submitted".
* **Submission Action:** Writes virtual item row.
* **Supabase Tables Involved:** `public.exhibition_items`.
* **Storage Uploads:** Exhibition item images.
* **Current Status:** ✅ Working

### 3.4 B2B scheduled Meeting Form
* **Path:** Modal inside Booth detail
* **Purpose:** Proposes structured meeting requests between trade visitor and booth exhibitor.
* **Fields:**
  - `meeting_date` (date, required)
  - `meeting_time` (time, required)
  - `visitor_name` (text, required)
  - `visitor_email` (email, required)
  - `visitor_phone` (tel, required)
  - `visitor_notes` (textarea, optional)
* **Client-side Validation:** Ensures meeting date is scheduled in the future.
* **Submission Action:** Writes meeting request.
* **Supabase Tables Involved:** `public.exhibition_meetings` (referenced via `booth_id` and `exhibition_id`).
* **Storage Uploads:** None.
* **Current Status:** ✅ Working
