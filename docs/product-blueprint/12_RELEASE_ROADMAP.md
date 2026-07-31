# ALSOUK — PROGRESSIVE PRODUCT ROADMAP (12_RELEASE_ROADMAP)

**Author:** Chief Product Officer & Lead UX Architect
**Status:** Approved Product Blueprint
**Target Audience:** Product Managers, Engineering Leads, Investors, Regional Partners
**Document Scope:** Multi-Phase Rollout Strategy, Objectives, Dependencies, and Completion Criteria

---

## Roadmap Overview

To establish ALSOUK as the dominant B2B conversational commerce platform in North Africa, we organize development and deployment into 5 progressive, high-impact releases.

```
+---------------------+     +---------------------+     +---------------------+
|      RELEASE 1      |     |      RELEASE 2      |     |      RELEASE 3      |
|  Merchant & Sourcing| --> | Conversational Chat | --> | Social Commerce     |
|  Identity Baseline  |     |  Real-time Engine   |     | Snapping Loops Feed |
+---------------------+     +---------------------+     +---------------------+
                                                                   |
                                                                   v
                            +---------------------+     +---------------------+
                            |      RELEASE 5      |     |      RELEASE 4      |
                            | Production Launch   | <-- | Smart Sourcing AI   |
                            | Scale and Logistics |     | Copilot Optimizer   |
                            +---------------------+     +---------------------+
```

---

## Detailed Release Phases

### Release 1: Foundational Sourcing & Merchant Identity (Active Target)

*   **Objectives:** Establish the core B2B marketplace discovery, phone-first auth, automated storefronts, and the progressive supplier workspace.
*   **Key Features:**
    *   Tunisian phone-first auth via client-side synthetic email conversions.
    *   3-Step Mobile Company Onboarding Wizard.
    *   First Product Quick Lister.
    *   Automated `public.stores` storefront insertion upon company creation.
    *   Multi-step Sourcing RFQ Engine with privacy-locked RLS policies.
    *   Tunisian Dinar millimes price formatting (3 decimal places, 3.1 exchange rate factor).
    *   Standardized 10 Scrolling Category rails with horizontal snapping.
*   **Dependencies:** Next.js App Router, Supabase Auth and Database.
*   **Risks:** High onboarding friction if logo/image URL requirements are too rigid.
*   **Completion Criteria:** A merchant can register an account, set up their business profile, and publish their first catalog product on mobile within 180 seconds.

---

### Release 2: Real-time Conversational SOUKI Chat

*   **Objectives:** Transition from standard external links (WhatsApp-only) to a secure, in-app messaging client that supports direct negotiating.
*   **Key Features:**
    *   Deploy `public.conversations` and `public.messages` database schemas.
    *   Implement real-time bidirectional message broadcasting using Supabase WebSockets.
    *   In-app Messaging Inbox showing buyer contact details and active negotiations.
    *   Product attachment and active RFQ cards integrated directly into chat messages.
    *   Unread indicators and mobile push notifications.
*   **Dependencies:** Release 1 baseline, Supabase Realtime Client.
*   **Risks:** Connection state loss on poor regional mobile networks (EDGE/3G).
*   **Completion Criteria:** Two users can exchange real-time text messages and product attachments within the app, with chat threads updating in under 500ms.

---

### Release 3: Social SOUKI Loops & Vertical Video Feeds

*   **Objectives:** Introduce visual social commerce discovery feeds to drive high engagement.
*   **Key Features:**
    *   Deploy `public.commercial_posts` and video database structures.
    *   TikTok-style snapping vertical video loop (`/discover`) optimized for mobile screens.
    *   Interactive product tag overlays displaying pricing in TND.
    *   Supplier dashboard panel for recording, optimizing, and uploading short video clips.
    *   Weekly "Commercial Post" updates showing active factory stock.
*   **Dependencies:** Release 2, HTML5 Video optimization pipelines, Supabase Storage.
*   **Risks:** Slow video buffering speeds on regional telecom networks.
*   **Completion Criteria:** Suppliers can publish 15-second looping videos from their dashboard, and buyers can browse them in the snapping vertical feed.

---

### Release 4: Smart Sourcing AI Copilot

*   **Objectives:** Automate B2B lead discovery and sourcing queries using intelligent, localized AI assistants.
*   **Key Features:**
    *   SOUKI Sourcing Assistant widget connected to OpenAI completions API.
    *   AI-powered semantic search bar supporting colloquial Tunisian Arabic queries.
    *   Automated Sourcing Matcher that parses buyer RFQs and notifies relevant verified suppliers.
    *   Intelligent profile completion feedback with suggestions on boosting scores.
*   **Dependencies:** Release 3, OpenAI completion tokens, `pgvector` index structures in Supabase.
*   **Risks:** AI hallucinations giving incorrect product specifications or pricing.
*   **Completion Criteria:** The SOUKI AI copilot successfully matches incoming buyer RFQs to relevant supplier categories in under 10 seconds.

---

### Release 5: Regional Scaling & Cross-Border Logistics

*   **Objectives:** Scale the platform across North Africa and integrate cross-border logistics support.
*   **Key Features:**
    *   Customizable storefront themes, custom domains, and custom category management.
    *   Dynamic currency converter (TND, Algerian Dinar (DZD), Libyan Dinar (LYD), Euro (EUR), USD).
    *   RNE Tunisian Business Registry validation integration.
    *   Cross-border freight and shipping calculators for North African land/maritime routes.
    *   Multi-owner advanced permissions management in `public.company_members`.
*   **Dependencies:** Release 4, regional trade registry APIs, currency exchange feeds.
*   **Risks:** Regulatory compliance and varying customs laws across Tunisia, Algeria, and Libya.
*   **Completion Criteria:** A Libyan buyer can view pricing converted to LYD and request custom shipping terms from a verified Tunisian manufacturer.
