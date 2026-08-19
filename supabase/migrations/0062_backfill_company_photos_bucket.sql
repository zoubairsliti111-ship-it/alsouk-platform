-- ALSOUK — 0062: Backfill the "company-photos" storage bucket + its
-- object policies, created directly against the live database.
--
-- Schema-drift audit (2026-08-19): the "company-photos" bucket (created
-- 2026-08-07, public, no size/mime restrictions) and its four object
-- policies exist live but are not mentioned anywhere under
-- supabase/migrations — unlike company-videos/post-media/product-images
-- (0015/0027) or live-recordings (0038), which were all created through a
-- committed migration. A fresh environment built from migrations alone
-- would be missing this bucket entirely, even though it's actively used
-- by Studio's photo uploads (app/studio/page.tsx,
-- components/studio/studio-panel.tsx) and the account page
-- (app/account/page.tsx).
--
-- Unlike 0060/0061, this one backfills rather than just comments: buckets
-- and storage policies are exactly the kind of thing this repo already
-- declares through migrations for reproducibility (see 0038), and doing
-- so is a straightforward, idempotent `on conflict do nothing` /
-- `drop policy if exists` — not a schema edit to an application table.
--
-- Every value below (bucket config, policy names, USING/WITH CHECK
-- expressions, unrestricted role list) matches the live database exactly
-- as of 2026-08-19 — this is a like-for-like backfill, not a hardening
-- pass. In particular the live policies are NOT scoped `to authenticated`
-- (unlike the live-recordings policies in 0038); that's reproduced as-is
-- here rather than "fixed", since narrowing it would be a behavior change
-- outside this migration's documentation-only scope.
--
-- Idempotent: safe to re-run.

insert into storage.buckets (id, name, public)
values ('company-photos', 'company-photos', true)
on conflict (id) do nothing;

drop policy if exists "Company photos publicly readable" on storage.objects;
create policy "Company photos publicly readable"
  on storage.objects for select using (bucket_id = 'company-photos');

drop policy if exists "Members upload company photos" on storage.objects;
create policy "Members upload company photos"
  on storage.objects for insert with check (
    bucket_id = 'company-photos'
    and public.is_company_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "Members update company photos" on storage.objects;
create policy "Members update company photos"
  on storage.objects for update using (
    bucket_id = 'company-photos'
    and public.is_company_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "Members delete company photos" on storage.objects;
create policy "Members delete company photos"
  on storage.objects for delete using (
    bucket_id = 'company-photos'
    and public.is_company_member(((storage.foldername(name))[1])::uuid)
  );
