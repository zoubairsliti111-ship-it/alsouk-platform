-- ALSOUK — 0024: Incremental verification of commercial posts system.
--
-- Note: Since `commercial_posts`, `commercial_post_media`, `commercial_post_likes`,
-- `commercial_post_comments`, `commercial_post_bookmarks`, and `commercial_post_views` are
-- already created in baseline migrations 0006 and 0017, we do NOT recreate them here.
-- Instead, we ensure all necessary indexes exist and update RLS policies to use the correct
-- `is_company_member` helper safely.
--
-- Idempotent: safe to re-run.

create index if not exists commercial_posts_company_id_idx on public.commercial_posts (company_id);
create index if not exists commercial_posts_author_id_idx on public.commercial_posts (author_id);
create index if not exists commercial_posts_status_idx on public.commercial_posts (status);
create index if not exists commercial_posts_deleted_at_idx on public.commercial_posts (deleted_at);
create index if not exists commercial_posts_created_at_idx on public.commercial_posts (created_at desc);

create index if not exists commercial_post_media_post_id_idx on public.commercial_post_media (post_id);
create index if not exists commercial_post_likes_post_id_idx on public.commercial_post_likes (post_id);
create index if not exists commercial_post_likes_user_id_idx on public.commercial_post_likes (user_id);
create index if not exists commercial_post_comments_post_id_idx on public.commercial_post_comments (post_id);
create index if not exists commercial_post_comments_user_id_idx on public.commercial_post_comments (user_id);
create index if not exists commercial_post_bookmarks_post_id_idx on public.commercial_post_bookmarks (post_id);
create index if not exists commercial_post_bookmarks_user_id_idx on public.commercial_post_bookmarks (user_id);
create index if not exists commercial_post_views_post_id_idx on public.commercial_post_views (post_id);

-- Update RLS policies using the unified helper
drop policy if exists "Company members can view draft/any posts of their company" on public.commercial_posts;
create policy "Company members can view draft/any posts of their company"
  on public.commercial_posts for select using (public.is_company_member(company_id));

drop policy if exists "Company members can insert posts" on public.commercial_posts;
create policy "Company members can insert posts"
  on public.commercial_posts for insert with check (public.is_company_member(company_id));

drop policy if exists "Company members can update their posts" on public.commercial_posts;
create policy "Company members can update their posts"
  on public.commercial_posts for update using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));

drop policy if exists "Company members can delete their posts" on public.commercial_posts;
create policy "Company members can delete their posts"
  on public.commercial_posts for delete using (public.is_company_member(company_id));

drop policy if exists "Company members can manage media of their posts" on public.commercial_post_media;
create policy "Company members can manage media of their posts"
  on public.commercial_post_media for all
  using (exists (select 1 from public.commercial_posts p where p.id = commercial_post_media.post_id and public.is_company_member(p.company_id)))
  with check (exists (select 1 from public.commercial_posts p where p.id = commercial_post_media.post_id and public.is_company_member(p.company_id)));

drop policy if exists "Users or company members can delete comments" on public.commercial_post_comments;
create policy "Users or company members can delete comments"
  on public.commercial_post_comments for delete using (
    user_id = auth.uid()
    or exists (select 1 from public.commercial_posts p where p.id = commercial_post_comments.post_id and public.is_company_member(p.company_id))
  );

drop policy if exists "Company members can view views stats" on public.commercial_post_views;
create policy "Company members can view views stats"
  on public.commercial_post_views for select using (
    exists (select 1 from public.commercial_posts p where p.id = commercial_post_views.post_id and public.is_company_member(p.company_id))
  );

-- storage bucket insertion and policies
insert into storage.buckets (id, name, public)
values ('commercial-posts', 'commercial-posts', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can select from commercial posts bucket" on storage.objects;
create policy "Anyone can select from commercial posts bucket"
  on storage.objects for select using (bucket_id = 'commercial-posts');

drop policy if exists "Company members can upload files to commercial posts bucket" on storage.objects;
create policy "Company members can upload files to commercial posts bucket"
  on storage.objects for insert with check (
    bucket_id = 'commercial-posts'
    and auth.role() = 'authenticated'
    and exists (select 1 from public.company_members cm where cm.user_id = auth.uid())
  );

drop policy if exists "Company members can delete files from commercial posts bucket" on storage.objects;
create policy "Company members can delete files from commercial posts bucket"
  on storage.objects for delete using (
    bucket_id = 'commercial-posts'
    and auth.role() = 'authenticated'
    and exists (select 1 from public.company_members cm where cm.user_id = auth.uid())
  );
