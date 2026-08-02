-- ALSOUK — Souk Exhibition Items Schema Update
--
-- Adds support for 'short_description' to the exhibition_items table
-- to fulfill the precise exhibit dashboard requirements.
--
-- Idempotent: safe to re-run.

alter table public.exhibition_items add column if not exists short_description text;
