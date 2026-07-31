# ALSOUK — COMPREHENSIVE USER EXPERIENCE (UX) AUDIT

**Author:** Lead Product Engineer & Product Architect
**Status:** Complete
**Date:** July 2026

---

## 1. Merchant Experience UX Audit

This section audits the platform's core workflows from the perspective of a Tunisian merchant or supplier:

### 1.1 First-Login Role Selection Modal
- **What works well:** On first login, a clean "Who are you?" modal prompts the user to select their role. The visual separation between "Buyer" and "Supplier" is clear, and the chosen role is successfully saved to user metadata.
- **What feels complicated:** The transition is client-side, meaning that after saving, the dashboard does not immediately update to show the newly unlocked merchant tabs without a manual page reload.
- **What feels unnecessary:** None. An explicit role selection is crucial for establishing the user's primary workspace.
- **What violates SOUKI:** Nothing. It directly channels the user into their native B2B workflow.
- **What should remain:** The clean, dual-card option layout.
- **What should be redesigned later:** Instantly update the state of active navigation tabs without a full browser reload.

### 1.2 Multi-Step Company Onboarding Wizard
- **What works well:** Splitting the onboarding process into distinct steps (Step 1: Name, Type, City; Step 2: Phone, WhatsApp, Socials; Step 3: Description, Logo) is highly effective for mobile screens. This layout reduces cognitive overload.
- **What feels complicated:** Manually pasting raw image URLs for logos and banners can be frustrating on mobile devices, compared to choosing files from a camera roll.
- **What feels unnecessary:** The requirement to enter a "Slug" manually. This should be auto-generated in the background based on the company's legal name.
- **What violates SOUKI:** Pasting raw external image URLs is non-standard for modern, simple social-commerce apps.
- **What should remain:** The logical step grouping and B2B classification selectors (Business Type and Industry).
- **What should be redesigned later:** Replace the manual URL input fields with direct file-upload zones connected to Supabase Storage.

### 1.3 Progressive Dashboard Layout
- **What works well:** The progressive disclosure of features (initially displaying only Profile, Products, RFQs, and Messages) prevents newly onboarded merchants from feeling overwhelmed.
- **What feels complicated:** Merchants must click "Activate Advanced Tools" to unlock export parameters, website strategy, languages, and verification documents. This button can be easy to miss.
- **What feels unnecessary:** Having a separate tab for "Digital Presence" and "Profile". These could be combined under a single profile manager.
- **What violates SOUKI:** It is very close to a traditional Western ERP layout, rather than resembling conversational social commerce feeds.
- **What should remain:** The interactive, localized metrics cards summarizing active Products, RFQs, and messages.
- **What should be redesigned later:** Introduce a more social-media style interface for publishing commercial posts and updates directly from the dashboard.

---

## 2. Buyer Experience UX Audit

This section audits the catalog discovery, search, and communication workflows from the perspective of a regional B2B buyer:

### 2.1 Sticky Header & Global Search
- **What works well:** The 64px sticky header provides instant access to global categories, language selectors, and search queries, making navigation highly intuitive.
- **What feels complicated:** The search bar performs rigid keyword matching, meaning it may return empty results if the buyer inputs colloquial Tunisian Arabic spelling variations.
- **What feels unnecessary:** Displaying advanced filtering parameters immediately on simple search results. This can clutter the view on narrow screens.
- **What violates SOUKI:** Traditional search inputs favor large, complex filters. SOUKI's philosophy is rooted in conversational and visual search mechanics.
- **What should remain:** The sticky header and localized language selector.
- **What should be redesigned later:** Introduce an AI-powered conversational search bar that understands natural phrasing and colloquial terms.

### 2.2 SOUKI Homepage & Categories scrolling
- **What works well:** The strict section sequence, 10 scrolling category icons, and lack of a large marketing hero ensure that buyers can immediately access live listings and opportunities.
- **What feels complicated:** Horizontal scroll rails lack explicit visual indicators (like fading edge gradients) to guide users on desktop browsers.
- **What feels unnecessary:** None. Every section directly supports immediate supplier discovery.
- **What violates SOUKI:** The featured product listing looks slightly like a standard e-commerce grid, rather than highlighting social engagement or supplier verified badges.
- **What should remain:** The horizontal scrolling rails and the strict, high-density homepage layout.
- **What should be redesigned later:** Add live engagement counters (e.g. "5 buyers active") on category tiles to emphasize live marketplace activity.

### 2.3 Product Details & RFQ Flow
- **What works well:** The product details view defensively hides unpopulated sections, ensuring a clean and professional profile for suppliers. The multi-step RFQ form is simple and accessible.
- **What feels complicated:** Buyers must manually fill out their contact details on every RFQ submission, even if they are logged in.
- **What feels unnecessary:** Forcing the buyer to select a target price on RFQs. In local markets, pricing is typically negotiated after establishing contact.
- **What violates SOUKI:** Traditional RFQ forms can feel cold and transactional compared to a direct, conversational WhatsApp message.
- **What should remain:** The prominent "Send Message on WhatsApp" CTA alongside the RFQ form.
- **What should be redesigned later:** Automatically pre-populate the RFQ form with the buyer's saved profile metadata if they are logged in.
