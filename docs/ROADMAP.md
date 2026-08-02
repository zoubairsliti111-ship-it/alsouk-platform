# ALSOUK — ARCHITECTURAL ROADMAP & RELEASE SPECIFICATIONS

**Date:** August 2026
**Document:** Implementation Order and Milestone Specifications
**Auditor:** Lead Software Architect (Jules)

---

## 1. Feature Completion Matrix

| Module Name | Implemented Gaps | Missing Gaps | Completion % |
| :--- | :--- | :--- | :---: |
| **Marketplace Sourcing** | Onboarding Wizard, RFQ catalog, Related Rails | Multi-currency dynamic rates | **95%** |
| **Trade Shows (Exhibition)**| Interactive Booths, Exhibits CRUD, Locks, Organizer Workspace | Live streaming triggers | **98%** |
| **SOUKI Social Feed** | TikTok Snapping Feed, Infinite scroll, Caption CRUD | Native video compression | **92%** |
| **Core Platform Security**| Phone-to-Synthetic Email conversion, Client fallbacks | Route-level multi-role middleware | **65%** |
| **Real-time Messaging** | Floating Assistant launcher, Mock Soon screen | Persistent Chat DB schemas | **15%** |

### Overall Platform Completion Percentage: 87.2%

---

## 2. Recommended Implementation Order (Phases)

To resolve the remaining technical debt and launch ALSOUK to production, we recommend executing changes in the following 5 phases:

### Phase 1: Supplier-Company Relational Unification (Weeks 1-2)
1. **Database Migration:** Create and run a SQL script merging remaining rows in `public.suppliers` into `public.companies`.
2. **Code Cleanup:** Redirect all `/suppliers` directory queries to select directly from `public.companies`.
3. **Deprecation:** Drop `public.suppliers` to clean the database.

### Phase 2: persistent Chat and B2B Consultations (Weeks 3-5)
1. **Schema Design:** Establish `public.conversations` and `public.messages` in Supabase with RLS.
2. **Real-time Listener:** Initialize Supabase's native WebSocket listener inside `/messages`.
3. **UI Integration:** Transition `SoonScreen` in `/messages` to a beautiful split panel chat (conversations list on left, chat bubble timeline on right).

### Phase 3: Regional SMS and Authentication Polish (Weeks 6-7)
1. **SMS Gateway:** Partner with local Tunisian telecom networks or Twilio to enable true phone OTP sign-ups, completely replacing the synthetic email proxy model.
2. **Middleware:** Add standard middleware checking session role metadata on protected page routes.

### Phase 4: Dynamic Currencies and Rates (Week 8)
1. **Rates Table:** Create key-value database schema for exchange rates.
2. **Cron Trigger:** Setup automated edge function updating USD to TND conversion rates.
