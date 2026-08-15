-- ALSOUK — 0045: Per-field opt-in visibility for company contact info.
--
-- Company profile redesign needs a Company Information panel showing
-- website/social/phone/whatsapp/address/company_size — but phone_number,
-- whatsapp_number, street_address and postal_code are direct personal
-- contact info that was never meant to be public by default just because
-- the owner filled the field in for internal/RFQ purposes. Same lesson as
-- profiles.phone (0041): don't assume "the column has a value" means "the
-- owner wants this on the public internet".
--
-- Six explicit boolean columns rather than a single jsonb settings blob —
-- the field set is small and fixed (not expected to grow), and explicit
-- columns keep the companies_public view's CASE WHEN predicates (0046)
-- simple and type-safe instead of needing jsonb key coalescing/casting
-- for every read.
--
-- Defaults are deliberately mixed, not uniformly false: phone/whatsapp/
-- address are opt-in (direct contact/location info, sensitive) so nothing
-- new becomes public without the owner explicitly choosing to. website/
-- social/company_size default to visible (opt-out) because a company that
-- filled in a website or social URL did so specifically to be found — an
-- opt-in requirement there would silently hide marketing info owners
-- already intended to share, the exact "worked yesterday, empty today"
-- regression this project keeps fixing elsewhere.
--
-- social_visible covers all five social columns (facebook_url,
-- instagram_url, tiktok_url, linkedin_url, youtube_url) as one toggle,
-- not five — matches how the feature was scoped (one "social" field, not
-- five). address_visible covers street_address + postal_code only;
-- city/country stay unconditionally public (already shown on the profile
-- today, not part of this control).
--
-- Idempotent: safe to re-run.

alter table public.companies
  add column if not exists website_visible boolean not null default true,
  add column if not exists social_visible boolean not null default true,
  add column if not exists company_size_visible boolean not null default true,
  add column if not exists phone_visible boolean not null default false,
  add column if not exists whatsapp_visible boolean not null default false,
  add column if not exists address_visible boolean not null default false;
