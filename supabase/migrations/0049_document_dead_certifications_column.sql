-- ALSOUK — 0049: Document companies.certifications as known-dead schema.
--
-- Re-verified via full-codebase search: zero reads, zero writes, anywhere
-- in the app. The "certifications" feature that actually exists (supplier
-- profile's Certifications card, Studio's certificate uploads) is powered
-- entirely by company_media rows with media_type = 'certificate' — a
-- completely separate mechanism from this column, which has never been
-- wired to anything.
--
-- Not dropped — this project's convention is no edits to existing schema
-- without a strong reason (see companies_public's migration 0046, which
-- excludes this same column from the public view rather than touching the
-- base table). This is purely a comment so a future reader querying the
-- schema doesn't have to independently re-derive "is this actually used?"
-- from scratch.
--
-- Idempotent: safe to re-run.

comment on column public.companies.certifications is
  'Dead column — confirmed unused anywhere in the app (verified 2026-08-16). '
  'The real certifications feature (supplier profile Certifications card, '
  'Studio uploads) is company_media rows with media_type = ''certificate'', '
  'unrelated to this column. Intentionally left in place, not dropped, per '
  'project convention against unforced schema edits.';
