-- ALSOUK — 0046: companies_public — the public-facing read surface for companies.
--
-- companies has ~55 columns and a SELECT policy of `using (true)` (correct —
-- the directory is meant to be public) with a full anon GRANT — meaning
-- every column, including tax_identifier, license_document_url and
-- business_email, is currently readable by anyone via a direct REST call
-- with the public anon key, regardless of any application-level filtering.
-- RLS is row-level only (same lesson as profiles.phone, 0041): it can't
-- conditionally hide one column of a visible row, so per-field opt-in
-- visibility (0045) has to be enforced by a view, not a policy predicate.
--
-- security_invoker = true so the view runs under the querying role's own
-- RLS/grants rather than the view owner's — same reasoning as
-- public_profiles_view (0041).
--
-- Explicit allowlist, not `select *` minus a few columns: tax_identifier,
-- license_document_url, business_email, metadata, profile_completion,
-- supplier_id, and the dead/legacy duplicate columns (company_name, phone,
-- email, whatsapp, address, founded_year, description_ar/fr/en, cover_url,
-- certifications, employee_count — none of these are written by
-- lib/supabase/company-service.ts, the real edit path) are simply absent
-- from this view, not nulled conditionally. They were never meant to be
-- public and don't belong in a public view regardless of any toggle.
--
-- website_url/social urls/phone_number/whatsapp_number/street_address+
-- postal_code/company_size are nulled out unless their matching *_visible
-- flag (0045) is true — this is the actual enforcement point for per-field
-- opt-in visibility, not a suggestion the frontend can choose to honor.
--
-- Callers needing the FULL row for their own company (edit forms in
-- Studio/Account) keep reading the base `companies` table directly, as
-- they do today — this view is additive, for public-facing reads only.
--
-- Idempotent: safe to re-run. Uses drop+create rather than `create or
-- replace view` — the latter can't reorder/insert columns mid-list on a
-- re-run, only append at the end, which bit during development.

drop view if exists public.companies_public;

create view public.companies_public
with (security_invoker = true) as
select
  id,
  owner_id,
  name,
  slug,
  tagline,
  description,
  logo_url,
  banner_url,
  business_type,
  primary_industry,
  country,
  city,
  year_established,
  verified,
  active,
  external_store_url,
  profile_views,
  created_at,
  case when website_visible then website_url else null end as website_url,
  case when social_visible then facebook_url else null end as facebook_url,
  case when social_visible then instagram_url else null end as instagram_url,
  case when social_visible then tiktok_url else null end as tiktok_url,
  case when social_visible then linkedin_url else null end as linkedin_url,
  case when social_visible then youtube_url else null end as youtube_url,
  case when phone_visible then phone_number else null end as phone_number,
  case when whatsapp_visible then whatsapp_number else null end as whatsapp_number,
  case when address_visible then street_address else null end as street_address,
  case when address_visible then postal_code else null end as postal_code,
  case when company_size_visible then company_size else null end as company_size
from public.companies;

grant select on public.companies_public to anon, authenticated, service_role;
