# ALSOUK — PROGRESSIVE PRODUCT ROADMAP

**Author:** Lead Product Engineer & Product Architect
**Status:** Complete
**Date:** July 2026

---

## Roadmap Overview

This roadmap outlines the progressive release strategy for ALSOUK across eight distinct phases. Each phase is designed to build on the previous one, transitioning the platform from an initial directory database into the leading B2B conversational commerce ecosystem in North Africa.

---

## Detailed Development Phases

### Phase 1: Foundation (Current Baseline)
- **Objectives:** Establish the core technical architecture, set up the multi-language provider framework, design the database schemas, and deploy a responsive, mobile-first homepage.
- **Key Features:** Sticky header navigation, 10 scrolling categories, modern search view, responsive homepage sections, and robust localized translations mapping.
- **Dependencies:** Next.js App Router, Tailwind CSS v4, Supabase Auth.
- **Risks:** Missing environment variables during server builds can cause compilation errors.
- **Estimated Complexity:** Low
- **Completion Criteria:** Code builds successfully on production servers without errors, and the homepage is fully interactive in English, French, and Arabic.

---

### Phase 2: Merchant Experience (Onboarding & Identity)
- **Objectives:** Streamline the merchant onboarding process, decoupling user accounts from business entities using a membership join-table layout.
- **Key Features:** Phone-first authentication conversions, step-by-step company registration onboarding, first product creation, default store generation, and progressive dashboard tab locks.
- **Dependencies:** `public.companies`, `public.company_members`, `public.stores`.
- **Risks:** Complex verification requirements can create friction during merchant sign-up.
- **Estimated Complexity:** Medium
- **Completion Criteria:** A merchant can register an account, set up their business profile, and publish their first catalog item on mobile devices in under 3 minutes.

---

### Phase 3: Buyer Experience (Sourcing & RFQ Engines)
- **Objectives:** Optimize the B2B catalog discovery and sourcing process for regional buyers.
- **Key Features:** Category-specific filter pages, detailed specifications view, direct WhatsApp chat links, and a multi-step RFQ builder.
- **Dependencies:** `public.products`, `public.rfqs`, `company-service.ts`.
- **Risks:** Spam submissions from unauthenticated guests could overload the RFQ database.
- **Estimated Complexity:** Medium
- **Completion Criteria:** Buyers can submit an RFQ, which is successfully stored in the database with appropriate RLS protections and visible inside the admin management panel.

---

### Phase 4: Marketplace (The Conversational SOUKI)
- **Objectives:** Implement a real-time conversational messaging engine to support in-app negotiations.
- **Key Features:** `public.conversations` and `public.messages` database schemas, real-time message broadcasting via Supabase, and dynamic chat layouts.
- **Dependencies:** Supabase Realtime Client.
- **Risks:** High connection counts on WebSocket protocols can increase infrastructure costs.
- **Estimated Complexity:** High
- **Completion Criteria:** Two authenticated users can exchange instant text messages and images within the app, with conversations updating in real time.

---

### Phase 5: Social Commerce (Videos & Commercial Feeds)
- **Objectives:** Transition the platform from static product grids to dynamic, visual discovery feeds.
- **Key Features:** Database-driven TikTok-style video reels, interactive social feeds, support for uploading short commercial posts, and live product tagging.
- **Dependencies:** HTML5 Video Player, `public.commercial_posts` table.
- **Risks:** High bandwidth costs and slow load times on mobile networks if video optimization is missing.
- **Estimated Complexity:** High
- **Completion Criteria:** Suppliers can post short video updates from their dashboards, which appear instantly in the dynamic discovery feeds of buyers.

---

### Phase 6: AI Features (The Smart Sourcing Copilot)
- **Objectives:** Deploy a pluggable, AI-powered sourcing assistant to guide buyers and match RFQs.
- **Key Features:** Context-specific trade prompts, natural language search matching, automated RFQ matcher, and an AI-powered conversational search bar.
- **Dependencies:** OpenAI API, `pgvector` indexes in Supabase.
- **Risks:** Hallucinations in product specifications or pricing guidelines can impact user trust.
- **Estimated Complexity:** High
- **Completion Criteria:** The AI copilot can analyze buyer requests and instantly match them with relevant suppliers or product catalogs.

---

### Phase 7: Growth (Cross-Border Sourcing Suite)
- **Objectives:** Scale the platform across North Africa by supporting regional trade standards and custom layouts.
- **Key Features:** Customizable merchant storefront themes, currency exchange feeds (USD to TND/LYD/DZD), tax document validators, and regional shipping integrations.
- **Dependencies:** External exchange rate and shipping APIs.
- **Risks:** Navigating varying regulatory and cross-border trade compliance requirements.
- **Estimated Complexity:** High
- **Completion Criteria:** Merchants can customize their storefront layouts, and buyers can view catalog pricing converted to their local currencies.

---

### Phase 8: Production Launch (Regional Staging)
- **Objectives:** Prepare the platform for high-scale regional deployment and monitor production health.
- **Key Features:** Integrated analytics dashboards, performance optimization sweeps, error tracking, database indexing optimization, and SMS login gateway setup.
- **Dependencies:** Vercel monitoring tools, regional SMS gateways.
- **Risks:** Scaling database queries during traffic spikes.
- **Estimated Complexity:** Medium
- **Completion Criteria:** Global production lighthouse scores exceed 90 across all mobile pages, with zero runtime compile warnings.
