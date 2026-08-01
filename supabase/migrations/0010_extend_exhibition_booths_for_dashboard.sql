-- ALSOUK — Extend exhibition tables for Booth Dashboard
--
-- Adds additional fields required for the Exhibitor Workspace/Booth Dashboard.
-- This includes status, contact, category, and metadata details.
--
-- Idempotent: safe to re-run.

-- 1. Extend exhibition_booths with status and booth-specific info
alter table public.exhibition_booths add column if not exists status text not null default 'Draft' check (status in ('Draft', 'Submitted', 'Published', 'Archived'));
alter table public.exhibition_booths add column if not exists title text;
alter table public.exhibition_booths add column if not exists short_description text;
alter table public.exhibition_booths add column if not exists contact_person text;
alter table public.exhibition_booths add column if not exists contact_phone text;
alter table public.exhibition_booths add column if not exists contact_whatsapp text;
alter table public.exhibition_booths add column if not exists contact_email text;
alter table public.exhibition_booths add column if not exists contact_website text;

-- 2. Extend exhibition_items (exhibits) with category
alter table public.exhibition_items add column if not exists category text;

-- 3. Extend exhibition_media with thumbnail_url
alter table public.exhibition_media add column if not exists thumbnail_url text;

-- 4. Extend exhibition_documents with language and description
alter table public.exhibition_documents add column if not exists language text;
alter table public.exhibition_documents add column if not exists description text;
