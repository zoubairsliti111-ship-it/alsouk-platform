# ALSOUK — API ROUTES AUDIT

This file documents all 48 active API routes within the ALSOUK backend framework.

---

## 1. Core Marketplace APIs

### 1.1 Search API (`/api/search`)
* **Endpoint:** `/api/search`
* **Method:** GET
* **Purpose:** Queries platform databases for companies, products, or virtual exhibits.
* **Authentication:** None (Public).
* **Validation:** Requires query string parameter `?q=...`.
* **Database Tables:** `public.companies`, `public.products`, `public.exhibition_booths`.
* **Response:** JSON list of matches grouped by type.
* **Current Status:** ✅ Working

### 1.2 Products API (`/api/products`)
* **Endpoint:** `/api/products`
* **Method:** GET, POST
* **Purpose:** Retrieves product grids or publishes new merchant catalog listings.
* **Authentication:** GET is Public, POST requires Authenticated Seller.
* **Database Tables:** `public.products`, `public.product_images`.
* **Response:** JSON list of product specifications.
* **Current Status:** ✅ Working

### 1.3 Company Profiler (`/api/companies`)
* **Endpoint:** `/api/companies`
* **Method:** GET, POST
* **Purpose:** Handles supplier registration data submissions or general company card views.
* **Authentication:** POST requires active Authenticated user.
* **Database Tables:** `public.companies`, `public.company_members`.
* **Response:** JSON of corporate entity.
* **Current Status:** ✅ Working

### 1.4 Request for Quotes Handler (`/api/rfqs`)
* **Endpoint:** `/api/rfqs`
* **Method:** GET, POST
* **Purpose:** Dispatches buyer quotes to suppliers or records them to the centralized lead board.
* **Authentication:** GET requires admin rights, POST is Public.
* **Database Tables:** `public.rfqs`.
* **Response:** Created RFQ ID.
* **Current Status:** ✅ Working

---

## 2. Notification System APIs

### 2.1 Get Unread Notifications (`/api/notifications/unread-count`)
* **Endpoint:** `/api/notifications/unread-count`
* **Method:** GET
* **Purpose:** Returns the unread alerts badge count.
* **Authentication:** Required (User session).
* **Database Tables:** `public.notifications`.
* **Response:** `{ unreadCount: number }`
* **Current Status:** ✅ Working

### 2.2 Mark All As Read (`/api/notifications/mark-all-read`)
* **Endpoint:** `/api/notifications/mark-all-read`
* **Method:** POST
* **Purpose:** Updates all pending alerts to read status.
* **Authentication:** Required (User session).
* **Database Tables:** `public.notifications` (updates `is_read` to `true`).
* **Response:** Success status.
* **Current Status:** ✅ Working

---

## 3. Trade Show Organizer APIs

### 3.1 Review Trade Registration Applications (`/api/exhibitions/organizer/applications`)
* **Endpoint:** `/api/exhibitions/organizer/applications`
* **Method:** GET, POST
* **Purpose:** Lists event applications or posts status decisions (Approvals / Rejections).
* **Authentication:** Gated (Organizer).
* **Database Tables:** `public.exhibition_applications`, `public.exhibition_booths`.
* **Response:** Updated status details.
* **Current Status:** ✅ Working

### 3.2 Organizer Statistics Engine (`/api/exhibitions/organizer/statistics`)
* **Endpoint:** `/api/exhibitions/organizer/statistics`
* **Method:** GET
* **Purpose:** Evaluates registration ratios, booth activity, and scheduled B2B trade meetings.
* **Authentication:** Required (Organizer).
* **Database Tables:** `public.exhibition_applications`, `public.exhibition_booths`, `public.exhibition_meetings`.
* **Response:** Graphical chart metrics.
* **Current Status:** ✅ Working

---

## 4. Exhibitor Dashboard APIs

### 4.1 Edit Booth Identity (`/api/exhibitions/booth`)
* **Endpoint:** `/api/exhibitions/booth`
* **Method:** GET, PUT
* **Purpose:** Fetches current booth workspace coordinates or publishes identity drafts.
* **Authentication:** Required (Booth owner).
* **Database Tables:** `public.exhibition_booths`.
* **Response:** Updated booth record.
* **Current Status:** ✅ Working

### 4.2 Exhibits Manager API (`/api/exhibitions/booth/exhibits`)
* **Endpoint:** `/api/exhibitions/booth/exhibits`
* **Method:** GET, POST, PUT, DELETE
* **Purpose:** Core CRUD API for virtual items and innovative prototype displays.
* **Authentication:** Required (Booth owner).
* **Lockout Mechanics:** Form fields and actions are disabled on the backend if booth is submitted.
* **Database Tables:** `public.exhibition_items`.
* **Response:** Updated items list.
* **Current Status:** ✅ Working

---

## 5. Visitor Experience APIs

### 5.1 Bookmark Event Booth (`/api/exhibitions/visitor/favorites`)
* **Endpoint:** `/api/exhibitions/visitor/favorites`
* **Method:** GET, POST
* **Purpose:** Bookmarks booths or exhibits for easy buyer reference.
* **Authentication:** None (reverts to localStorage in non-auth setups).
* **Database Tables:** `public.exhibition_favorites`.
* **Response:** Saved list of entries.
* **Current Status:** ✅ Working

### 5.2 Private Notes Synchronizer (`/api/exhibitions/visitor/notes`)
* **Endpoint:** `/api/exhibitions/visitor/notes`
* **Method:** GET, POST
* **Purpose:** Persists buyer's personal remarks regarding specific trade booths.
* **Database Tables:** `public.exhibition_notes`.
* **Response:** Confirmation.
* **Current Status:** ✅ Working
