-- ALSOUK — 0027: Incremental verification of social commerce layer.
--
-- Note: Since `posts`, `post_media`, `post_likes`, `post_comments`, `company_follows`,
-- and `live_sessions` are already defined in baseline migration 0015_social_commerce.sql,
-- we do NOT recreate those tables.
-- Instead, we verify indexes, ensure all RLS policies are up-to-date and robust,
-- and recreate/check triggers safely.
--
-- Idempotent: safe to re-run.

create index if not exists post_likes_post_id_idx on public.post_likes (post_id);
create index if not exists post_likes_user_id_idx on public.post_likes (user_id);
create index if not exists post_comments_post_id_idx on public.post_comments (post_id, created_at);
create index if not exists company_follows_company_id_idx on public.company_follows (company_id);
create index if not exists company_follows_user_id_idx on public.company_follows (user_id);
create index if not exists live_sessions_company_id_idx on public.live_sessions (company_id, status);

-- Update RLS policies to use the new security helper functions safely
drop policy if exists "Members insert posts" on public.posts;
create policy "Members insert posts" on public.posts for insert with check (public.is_company_member(company_id) and author_id = auth.uid());

drop policy if exists "Members update posts" on public.posts;
create policy "Members update posts" on public.posts for update using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));

drop policy if exists "Members delete posts" on public.posts;
create policy "Members delete posts" on public.posts for delete using (public.is_company_member(company_id));

drop policy if exists "Members manage post media" on public.post_media;
create policy "Members manage post media"
  on public.post_media for all
  using (exists (select 1 from public.posts p where p.id = post_media.post_id and public.is_company_member(p.company_id)))
  with check (exists (select 1 from public.posts p where p.id = post_media.post_id and public.is_company_member(p.company_id)));

drop policy if exists "Author or company removes comment" on public.post_comments;
create policy "Author or company removes comment"
  on public.post_comments for delete using (
    user_id = auth.uid()
    or exists (select 1 from public.posts p where p.id = post_comments.post_id and public.is_company_member(p.company_id))
  );

drop policy if exists "Members create live" on public.live_sessions;
create policy "Members create live" on public.live_sessions for insert with check (public.is_company_member(company_id) and created_by = auth.uid());

drop policy if exists "Members update live" on public.live_sessions;
create policy "Members update live" on public.live_sessions for update using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));

drop policy if exists "Members delete live" on public.live_sessions;
create policy "Members delete live" on public.live_sessions for delete using (public.is_company_member(company_id));

-- Storage buckets for social media (fully idempotent)
insert into storage.buckets (id, name, public) values ('post-media', 'post-media', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('company-videos', 'company-videos', true) on conflict (id) do nothing;

drop policy if exists "Social media publicly readable" on storage.objects;
create policy "Social media publicly readable"
  on storage.objects for select using (bucket_id in ('post-media', 'company-videos'));

drop policy if exists "Members upload social media" on storage.objects;
create policy "Members upload social media"
  on storage.objects for insert to authenticated with check (
    bucket_id in ('post-media', 'company-videos')
    and public.is_company_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "Members update social media" on storage.objects;
create policy "Members update social media"
  on storage.objects for update to authenticated using (
    bucket_id in ('post-media', 'company-videos')
    and public.is_company_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "Members delete social media" on storage.objects;
create policy "Members delete social media"
  on storage.objects for delete to authenticated using (
    bucket_id in ('post-media', 'company-videos')
    and public.is_company_member(((storage.foldername(name))[1])::uuid)
  );
