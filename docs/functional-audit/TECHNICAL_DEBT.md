# ALSOUK — TECHNICAL DEBT & ARCHITECTURAL ASSESSMENT

This document registers the comprehensive technical debt profile of the ALSOUK codebase, analyzing system design and architecture constraints.

---

## 1. Primary Technical Debt Categories

### 1.1 Dual-Schema Coexistence (Highest Severity)
* **Risk:** Holding redundant structures like `suppliers` and `companies`, or `posts` and `commercial_posts` duplicates backend code and increases maintenance overhead.
* **Remediation:** Plan database migrations to fully deprecate old schema models.

### 1.2 Phone-Only Auth vs Password Recovery Architecture
* **Risk:** Generating synthetic emails (`phoneXXXXXXXX@alsouk.com`) is a creative way to use standard email authentication, but without a dedicated SMS gateway, phone-based profiles cannot safely reset passwords.
* **Remediation:** Connect a regional SMS API (such as Twilio or local Tunisian telecom integrations) to support true phone OTP logins and secure resets.

### 1.3 Missing Deep Multi-Language Database Schema
* **Risk:** The localization engine (`lib/i18n.ts`) correctly switches static interface text between Arabic, French, and English. However, dynamic user data (product titles, descriptions, company taglines) is stored in single text columns, preventing multilingual entry for the same product.
* **Remediation:** Transition text columns for dynamic descriptions to Postgres `jsonb` fields (e.g., `{ "en": "Olive Oil", "fr": "Huile d'olive", "ar": "زيت زيتون" }`).

### 1.4 Hardcoded Exchange Rates
* **Risk:** Using a static constant of `3.1` to calculate USD-to-TND conversions inside format functions works for sandboxes but causes monetary deviations in real-world catalogs.
* **Remediation:** Query exchange rate configurations dynamically from an active currency settings table.
