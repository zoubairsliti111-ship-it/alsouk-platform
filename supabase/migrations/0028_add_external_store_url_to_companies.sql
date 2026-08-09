-- ALSOUK — 0028: Tier 1 of "link an external e-commerce store".
--
-- Merchants who already sell on their own online store (Shopify, a custom
-- site, a Facebook shop, …) can record that address on their company profile.
-- The public supplier profile renders it as a "Visit External Store" link.
--
-- Nullable and additive only: merchants without an external store are
-- unaffected and the column stays NULL (rendered as nothing, never as a
-- fabricated placeholder).
--
-- Idempotent: safe to re-run.

alter table public.companies
  add column if not exists external_store_url text;

comment on column public.companies.external_store_url is
  'Absolute http(s) URL of the company''s own online store hosted outside ALSOUK. NULL when the merchant has no external store.';
