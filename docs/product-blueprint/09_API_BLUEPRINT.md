# ALSOUK — API LAYER BLUEPRINT (09_API_BLUEPRINT)

**Author:** Chief Product Officer & Lead API Architect
**Status:** Approved Product Blueprint
**Target Audience:** Frontend Integrators, Backend Developers, QA Automation Engineers
**Document Scope:** Endpoint Definitions, Request/Response Schema Contracts, Validation Protocols, and Error Codes

---

## 1. Global API Standards

All ALSOUK API handlers (under `app/api/`) must conform to the following standards:

*   **Format:** JSON-only payloads for both requests and responses.
*   **Protocol:** REST-based operations utilizing standard HTTP methods (GET, POST, PUT, DELETE, PATCH).
*   **Authentication:** JWT-based session transport managed via Supabase Client and Middleware.
*   **Headers:**
    *   `Content-Type: application/json`
    *   `Accept-Language`: Toggles localized error messages (`ar`, `fr`, `en`).

---

## 2. API Endpoints Specification

### 2.1 RFQ Submission Endpoint

Creates a new sourcing Request for Quote. Supports both guest and authenticated users.

*   **Route:** `POST /api/rfqs`
*   **Authentication:** Public (Guest/Anon allowed; logged-in sessions automatically inherit user metadata).
*   **Rate Limiting:** Maximum 5 requests per 10 minutes per IP.
*   **Request Body Schema:**
    ```json
    {
      "category_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "quantity": 150,
      "unit": "tons",
      "target_price": 450.500,
      "description": "Looking for food-grade cardboard containers for regional export.",
      "buyer_name": "Karim Daoud",
      "buyer_phone": "+21698765432",
      "buyer_email": "karim@lait.tn",
      "company_id": "c16d3f25-bfa3-4315-9c8a-7e618bd03cbe"
    }
    ```
*   **Response Schema (Success - 201 Created):**
    ```json
    {
      "success": true,
      "message": "RFQ submitted successfully.",
      "data": {
        "id": "e2a14e96-a83d-4c3e-9080-692fc3e8cbfa",
        "created_at": "2026-07-15T10:30:00Z"
      }
    }
    ```

---

### 2.2 SOUKI Video Feed Fetch

Retrieves dynamic vertical video reels for the SOUKI discovery page.

*   **Route:** `GET /api/discover/videos`
*   **Authentication:** Public.
*   **Query Parameters:**
    *   `limit` (integer, default: 10): Page size.
    *   `cursor` (string, optional): Pagination cursor.
    *   `category` (string, optional): Filter by category slug.
*   **Response Schema (Success - 200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "items": [
          {
            "id": "v3b58c1f-df7a-42b7-8149-65239e25ca31",
            "video_url": "https://storage.alsouk.com/videos/factory_loop_01.mp4",
            "caption": "Inside our olive oil bottling line in Sousse.",
            "company": {
              "name": "Sousse Olive Co.",
              "logo_url": "https://storage.alsouk.com/logos/sousse_olive.png",
              "verified": true
            },
            "product": {
              "id": "p5a18c3d-d34e-4e4b-b27e-851f893e1b7d",
              "name": "Extra Virgin Olive Oil Bulk",
              "price": "14.500",
              "currency": "TND"
            }
          }
        ],
        "next_cursor": "eyJjcmVhdGVkX2F0IjoiMjAyNi0wNy0xNVQxMDozMDowMFoifQ=="
      }
    }
    ```

---

### 2.3 Real-time Message Send

Sends a message within an established conversation.

*   **Route:** `POST /api/messages`
*   **Authentication:** Restricted. Must be a participant in the conversation.
*   **Request Body Schema:**
    ```json
    {
      "conversation_id": "c76a3e14-df3a-4eb1-9876-ef893a0d1bfe",
      "text": "Hello, we can supply this packaging with an MOQ of 100 units.",
      "media_url": "https://storage.alsouk.com/chat/photo_123.jpg"
    }
    ```
*   **Response Schema (Success - 201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "m1b9f4e2-89cd-4bc3-90d0-e123af980bfa",
        "sender_id": "u8b9c2a1-df3a-4eb1-9876-ef893a0d1bfe",
        "created_at": "2026-07-15T11:45:00Z"
      }
    }
    ```

---

## 3. Global Error Handling Specification

All API handlers must return a standard error payload format when an operation fails:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The phone number must be a valid 8-digit Tunisian number.",
    "details": [
      {
        "field": "buyer_phone",
        "issue": "Must contain exactly 8 digits."
      }
    ]
  }
}
```

### 3.1 Standardized Error Codes

| Error Code | HTTP Status | Description |
| :--- | :---: | :--- |
| `UNAUTHORIZED` | 401 | Missing, expired, or invalid session token. |
| `FORBIDDEN` | 403 | Authenticated user lacks permission for the resource. |
| `NOT_FOUND` | 404 | Target resource (product, company, conversation) does not exist. |
| `VALIDATION_FAILED` | 400 | Request payload failed format or schema validation. |
| `RATE_LIMIT_EXCEEDED`| 429 | Request threshold breached. |
| `INTERNAL_ERROR` | 500 | Database connection failures or unexpected system crashes. |

---

## 4. Security & Rate Limiting Guidelines

1.  **JWT Verification:** Middleware (`middleware.ts`) automatically intercepts incoming requests to protected endpoints, parses the authorization header, and rejects unauthenticated queries with `401 UNAUTHORIZED`.
2.  **Rate Limiting Rules:**
    *   Public API actions (such as RFQ creation and search queries) are limited to **50 requests per minute per IP address**.
    *   Sensitive endpoints (such as auth registration and login) are limited to **5 requests per minute per IP address** to mitigate brute-force attacks.
3.  **Data Sanitization:** All text inputs are trimmed and sanitized in the backend to prevent SQL injection and cross-site scripting (XSS) attacks.
