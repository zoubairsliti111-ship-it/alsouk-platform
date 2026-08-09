# ALSOUK — PRODUCT FEATURE MATRIX

This document establishes the official feature availability and implementation status matrix for the ALSOUK B2B Platform.

---

## 1. Core Platform Features

| Feature Area | Sub-Feature / Functionality | Classification | Technical Backend | Notes / Constraints |
| :--- | :--- | :---: | :--- | :--- |
| **Authentication** | Email & Password Login / Signup | ✅ Production Ready | Supabase Auth API | Implements automatic synthetic email conversion for phone-based profiles. |
| | Registration Roles (Buyer / Seller) | ✅ Production Ready | `public.companies` | Determines initial dashboard loading. |
| **Merchant Portal** | Supplier 3-Step Onboarding Wizard | ✅ Production Ready | `public.companies` | Completed in-app. Transitions instantly to product creation. |
| | First Product Creation Flow | ✅ Production Ready | `public.products` | Minimal fields to maximize merchant engagement. |
| | Progressive Tier Adaptations | ✅ Production Ready | `profile_level` | Tabs, form fields and analytics adapt strictly based on DB level. |
| | Corporate Profile Editor | ✅ Production Ready | `public.companies` | Dynamic profile details updates. |
| **Marketplace Catalog**| Product Directory Grid | ✅ Production Ready | `public.products` | Features pagination and search integrations. |
| | Product Detail Specifications | ✅ Production Ready | `public.products` | Details origin city, MOQ, and WhatsApp click targets. |
| | Public Company Storefronts | ✅ Production Ready | `public.companies` | Defensive layout hiding unpopulated segments. |
| **Social Feed Engine** | Infinite Scrolling Home Feed | ✅ Production Ready | `public.commercial_posts` | Real-time scroll feed on Homepage. |
| | TikTok-style Discover View | ✅ Production Ready | `public.commercial_posts` | Located at `/discover` with action counters. |
| | Company Updates Tab | ✅ Production Ready | `public.commercial_posts` | Renders on public storefronts under 'Daily Feed'. |
| **RFQ Bidding Engine** | Request For Quote dispatcher | ✅ Production Ready | `public.rfqs` | Integrates supplier and company foreign key triggers. |
| | Floating Quick RFQ Modal | ✅ Production Ready | `public.rfqs` | Triggerable from any product or store. |
| **Notification Engine**| real-time notifications | ✅ Production Ready | `public.notifications` | Built-in unread indicators on top bar. |
| | Quick "Mark All Read" trigger | ✅ Production Ready | `/api/notifications/` | Triggers background state update. |

---

## 2. Virtual Exhibition Module

| Feature Area | Sub-Feature / Functionality | Classification | Technical Backend | Notes / Constraints |
| :--- | :--- | :---: | :--- | :--- |
| **Exhibition Hall** | Multi-Event Directory Hall | ✅ Production Ready | `public.exhibitions` | Event tracking, schedules, and active counts. |
| | Virtual Trade Booths Profile | ✅ Production Ready | `public.exhibition_booths` | Simulates physical presence with specialized catalog views. |
| | Exhibit Prototype Workspace | ✅ Production Ready | `public.exhibition_items` | Handles innovative prototypes (not standard products). |
| **Exhibitor Portal** | Booth Management Dashboard | ✅ Production Ready | `public.exhibition_booths` | Isolated management view for booth operators. |
| | Booth Identity & Logo Editor | ✅ Production Ready | `public.exhibition_booths` | Supports separate logo and booth-specific banners. |
| | Under Review Lockout Shield | ✅ Production Ready | `status` check | Disables and hides fields once booth is submitted. |
| | Live Preview Simulator | ✅ Production Ready | `/preview` route | Lets exhibitors inspect layout as visitors see it. |
| **Organizer Portal** | Command Home / Stats Overview | ✅ Production Ready | `/api/exhibitions/` | Displays real-time metrics of the event. |
| | Exhibitor Application Reviews | ✅ Production Ready | `exhibition_applications`| Approval modal with automated booth creation. |
| | Layout Spatial Allocation | ✅ Production Ready | `exhibition_booths` | Allocates virtual floor numbers and statuses. |
| **Visitor Hub** | Booth & Item Bookmarking | ✅ Production Ready | Local + API Sync | Allows visitors to save exhibitors. |
| | Private Local Notes | ✅ Production Ready | Local + API Sync | Allows trade visitors to record private remarks. |
| | Scheduled B2B Meetings | ✅ Production Ready | `public.exhibition_meetings` | Gated scheduled calendar proposals. |
| | Mobile QR Scan Canvas | ✅ Production Ready | HTML5 Canvas | Generates printable visitor entry badges. |

---

## 3. Administrative Portal (`/admin`)

| Feature Area | Sub-Feature / Functionality | Classification | Technical Backend | Notes / Constraints |
| :--- | :--- | :---: | :--- | :--- |
| **Admin Panel** | Multi-Event Tradeshow Setup | ✅ Production Ready | `public.exhibitions` | Complete setup form (Title, Dates, Logos, Statuses). |
| | Global Application Pipeline | ✅ Production Ready | `exhibition_applications`| Review pipeline for all trade registrations. |
| | System-wide B2B RFQ Lead Board| ✅ Production Ready | `public.rfqs` | Allows platform admins to review custom bid leads. |
| | Interactive SVG Charts | ✅ Production Ready | SVG Elements | Responsive CSS-rendered graphical statistics. |
| | Multi-Format Document Export | ✅ Production Ready | `/api/analytics/` | Simulated download generation of PDF/CSV reports. |
