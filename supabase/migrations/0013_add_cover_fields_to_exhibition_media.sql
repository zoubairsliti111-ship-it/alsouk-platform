-- ALSOUK — Add is_cover field to exhibition_media
--
-- Extends the exhibition_media table to support designating an image as the booth's cover image.
--
-- Idempotent: safe to re-run.

alter table public.exhibition_media add column if not exists is_cover boolean not null default false;
