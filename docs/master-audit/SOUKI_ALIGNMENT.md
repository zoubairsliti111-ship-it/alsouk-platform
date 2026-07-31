# ALSOUK — SOUKI PHILOSOPHY & PRODUCT ALIGNMENT SPECIFICATION

**Author:** Lead Product Engineer & Product Architect
**Status:** Complete
**Date:** July 2026

---

## 1. Defining the SOUKI Product Philosophy

Traditional B2B directories (like Alibaba) and e-commerce platforms (like Amazon) are built around rigid, highly transactional processes, including complex purchase orders, standardized shopping carts, and formal email exchanges.

In Tunisia and across North Africa, B2B trade operates differently. Business is relational, conversational, and highly visual. Local merchants often build trust and negotiate deals through:
- **WhatsApp:** For exchanging raw product photos, coordinate logistics, and agree on pricing.
- **Facebook & Social Pages:** For broadcasting stock availability and sharing commercial updates.
- **Short Video Feeds:** For showcasing manufacturing capabilities and giving factory tours.

**ALSOUK is built on the SOUKI Philosophy.** Instead of forcing merchants to adopt complex enterprise interfaces, ALSOUK matches how regional businesses actually trade. It blends structured, verified directory profiles with conversational interactions and mobile-friendly visual discovery feeds.

---

## 2. Product Alignment Matrix

Below is an audit of ALSOUK's core features, evaluating how closely they align with the SOUKI philosophy:

| Feature Name | SOUKI Alignment | Explanation |
| :--- | :---: | :--- |
| **SOUKI Live Discovery Feed** | **YES** | Matches modern social discovery habits by letting buyers browse product listings through interactive video feeds rather than raw text tables. |
| **Direct WhatsApp Linkage** | **YES** | Lets buyers connect instantly with suppliers on WhatsApp, bypassing long contact forms and facilitating quick negotiations. |
| **Synthetic Email Auth Flow** | **YES** | Fits regional habits by allowing merchants to sign up using only their phone number, converting it into a synthetic email under the hood to bypass standard email requirements. |
| **Multi-Step Company Onboarding** | **YES** | Features a simple, step-by-step mobile layout that makes it easy for local business owners to set up their company profiles. |
| **Progressive Dashboards** | **YES** | Keeps things simple for new suppliers by displaying only core tools initially, unlocking advanced features only when the user is ready. |
| **Request for Quote (RFQ) Form** | **PARTIALLY** | The multi-step RFQ form is clean and straightforward, but its structured, transactional layout can feel rigid compared to a simple, direct chat message. |
| **Storefront Customization** | **PARTIALLY** | Offers customizable storefront banners and logos, but lacks support for publishing social-media style updates or commercial posts. |
| **Global Categories Index** | **PARTIALLY** | The scrolling category rail works well on mobile, but uses a standard grid layout rather than a visual, feed-based approach. |
| **In-App Messaging Inbox** | **NO** | Currently a placeholder route. To support conversational commerce, it needs to be connected to a database schema that supports real-time, interactive chat. |

---

## 3. SOUKI Product Guidelines for Future Development

To maintain strong alignment with the SOUKI philosophy, future feature development should follow these guidelines:
1. **Prioritize Conversational Workflows:** Always offer a direct WhatsApp or chat option alongside formal B2B forms (such as RFQs).
2. **Focus on Visual Discovery:** Rely on high-quality photos, interactive video loops, and live activity metrics rather than dense text grids.
3. **Optimize for Mobile First:** Design interfaces for a standard 390px mobile viewport, ensuring touch-friendly controls and bottom-anchored navigation are standard.
