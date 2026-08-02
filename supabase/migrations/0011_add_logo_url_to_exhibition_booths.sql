-- ALSOUK — Add logo_url to exhibition_booths
--
-- This allows exhibitors to customize/override their booth logo independently of the core company profile.
--
-- Idempotent: safe to re-run.

alter table public.exhibition_booths add column if not exists logo_url text;
