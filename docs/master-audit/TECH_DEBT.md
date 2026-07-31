# ALSOUK — TECHNICAL DEBT & ARCHITECTURAL RISKS REGISTER

**Author:** Lead Product Engineer & Product Architect
**Status:** Complete
**Date:** July 2026

---

## 1. Technical Debt Overview

As a rapidly growing B2B marketplace, ALSOUK must balance quick feature delivery with long-term codebase health. This register tracks architectural complexity, code duplication, and technical debt to help developers prioritize future refactoring efforts.

---

## 2. Technical Debt Matrix

Below is the definitive catalog of identified technical debt items, including their impact, resolution effort, and recommended remediation plans:

| ID | Debt Title | Category | Impact | Effort | Remediation Plan |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **TD-01** | **Legacy Suppliers Schema Duplication** | Database / Code | High | Medium | Merge `public.suppliers` into `public.companies` and route all profile lookups through the modernized company service layer. |
| **TD-02** | **Hardcoded Exchange Rate Multiplier** | Code Quality | Medium | Low | Store USD-to-TND conversion factors in a configuration table or pull them from a live currency API rather than using a static multiplier (`3.1`) in `lib/format.ts`. |
| **TD-03** | **Manual Image URL Form Inputs** | User Experience | High | Low | Replace manual image URL fields in onboarding forms with direct file-upload zones connected to Supabase Storage. |
| **TD-04** | **Static Discover Feed Content** | Product Quality | High | Medium | Create a dedicated `public.commercial_posts` database schema to dynamically pull videos, views, and product associations. |
| **TD-05** | **Empty Messages Table Layout** | Database / Schema | Critical | High | Design `public.conversations` and `public.messages` tables, and implement Realtime listeners to support instant in-app messaging. |
| **TD-06** | **Lack of Input Sanitization** | API Security | High | Low | Adopt a validation schema library (such as `Zod`) on API routes to enforce structured inputs. |
| **TD-07** | **Incomplete RTL Overrides** | Design System | Low | Low | Audit older components to ensure they favor Tailwind logical properties (`ms-*`, `me-*`) over directional margins (`ml-*`, `mr-*`). |
| **TD-08** | **Loose Transaction Boundaries** | Code Quality | Medium | Medium | Wrap company onboarding creation and `company_members` join insertions in a transactional DB function to prevent orphaned records. |
| **TD-09** | **Unused Legacy Route Handlers** | Code Quality | Low | Low | Delete unused backend authentication API endpoints (such as `api/auth/register` and `api/auth/reset-password`) to keep the routing layer clean. |
| **TD-10** | **Monolithic Account Page** | Code Quality | Medium | Medium | Break down `app/account/page.tsx` into smaller, dedicated sub-components (such as `PersonalSection`, `CompanySection`, `SecuritySection`) to improve readability and maintainability. |

---

## 3. High-Priority Remediation Actions

To prevent technical debt from slowing down future development, the engineering team should prioritize the following actions:
1. **Unify Database Schemas (TD-01):** Consolidate legacy supplier directory records with modern companies to establish a single source of truth for business profiles.
2. **Implement Input Validation (TD-06):** Add schema-based validation to all public API endpoints to protect against injection and invalid data entries.
3. **Storage Integration (TD-03):** Transition from manual URL text fields to direct storage uploads for product images, logos, and business certificates.
