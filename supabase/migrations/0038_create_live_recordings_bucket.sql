-- ALSOUK — 0038: Storage bucket for live-broadcast VOD recordings.
--
-- No new column: live_sessions.replay_url already exists (0015_social_commerce.sql)
-- and app/live/[id]/page.tsx already plays it back when a session has ended.
-- This migration only adds the bucket + object policies the host's browser
-- uploads the recorded webm into after "End Live", namespaced the same way
-- as post-media/company-videos: "{company_id}/{file}".

insert into storage.buckets (id, name, public)
values ('live-recordings', 'live-recordings', true)
on conflict (id) do nothing;

drop policy if exists "Live recordings publicly readable" on storage.objects;
create policy "Live recordings publicly readable"
  on storage.objects for select using (bucket_id = 'live-recordings');

drop policy if exists "Members upload live recordings" on storage.objects;
create policy "Members upload live recordings"
  on storage.objects for insert to authenticated with check (
    bucket_id = 'live-recordings'
    and public.is_company_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "Members update live recordings" on storage.objects;
create policy "Members update live recordings"
  on storage.objects for update to authenticated using (
    bucket_id = 'live-recordings'
    and public.is_company_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "Members delete live recordings" on storage.objects;
create policy "Members delete live recordings"
  on storage.objects for delete to authenticated using (
    bucket_id = 'live-recordings'
    and public.is_company_member(((storage.foldername(name))[1])::uuid)
  );
