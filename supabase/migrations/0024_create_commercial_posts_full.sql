-- ALSOUK — 0024: Commercial posts system (brand new tables, no legacy
-- conflict). Merges the historical intent of 0006 + 0017 directly into
-- their final combined shape in a single new file — since neither ever
-- applied to production, there is no need to replay them as two separate
-- historical steps.
--
-- Tables: commercial_posts, commercial_post_media, commercial_post_likes,
-- commercial_post_comments, commercial_post_bookmarks, commercial_post_views.
-- Plus the `commercial-posts` Storage bucket and its object policies.
--
-- DEPENDS ON: 0019 (public.company_members, public.is_company_member helper).
--
-- ⚠️ NOTE FOR THE APPLICATION TEAM (not a migration concern, flagged for
-- awareness): lib/services/posts-service.ts (this table) and
-- lib/services/social-service.ts (public.posts / public.post_media, created
-- in 0027) are two parallel, independent implementations of "commercial
-- posts" that both exist in the current codebase. This migration creates
-- the backing tables for BOTH so neither fails at the database level — but
-- resolving which one the product actually uses is a code decision, tracked
-- separately, not something a migration can or should decide.
--
-- Idempotent: safe to re-run.

create table if not exists public.commercial_posts (
  id           uuid        primary key default gen_random_uuid(),
  company_id   uuid        not null references public.companies (id) on delete cascade,
  author_id    uuid        references auth.users (id) on delete set null,
  status       text        not null default 'draft' check (status in ('draft', 'published')),
  visibility   text        not null default 'public',
  content      text        not null,
  images       text[]      not null default '{}'::text[],
  attachments  jsonb       not null default '[]'::jsonb,
  view_count   integer     not null default 0 check (view_count >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create table if not exists public.commercial_post_media (
  id             uuid        primary key default gen_random_uuid(),
  post_id        uuid        not null references public.commercial_posts (id) on delete cascade,
  storage_bucket text        not null default 'commercial-posts',
  storage_path   text        not null,
  url            text        not null,
  media_type     text        not null default 'image' check (media_type in ('image', 'video')),
  position       integer     not null default 0,
  created_at     timestamptz not null default now()
);

create table if not exists public.commercial_post_likes (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.commercial_posts (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists public.commercial_post_comments (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.commercial_posts (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  body       text        not null check (length(btrim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commercial_post_bookmarks (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.commercial_posts (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists public.commercial_post_views (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.commercial_posts (id) on delete cascade,
  user_id    uuid        references auth.users (id) on delete set null,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

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

drop trigger if exists commercial_posts_set_updated_at on public.commercial_posts;
create trigger commercial_posts_set_updated_at
  before update on public.commercial_posts
  for each row execute function public.set_updated_at();

drop trigger if exists commercial_post_comments_set_updated_at on public.commercial_post_comments;
create trigger commercial_post_comments_set_updated_at
  before update on public.commercial_post_comments
  for each row execute function public.set_updated_at();

alter table public.commercial_posts enable row level security;
alter table public.commercial_post_media enable row level security;
alter table public.commercial_post_likes enable row level security;
alter table public.commercial_post_comments enable row level security;
alter table public.commercial_post_bookmarks enable row level security;
alter table public.commercial_post_views enable row level security;

drop policy if exists "Anyone can view published posts" on public.commercial_posts;
create policy "Anyone can view published posts"
  on public.commercial_posts for select using (status = 'published' and deleted_at is null);

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

drop policy if exists "Anyone can view media of published posts" on public.commercial_post_media;
create policy "Anyone can view media of published posts"
  on public.commercial_post_media for select using (
    exists (select 1 from public.commercial_posts p where p.id = commercial_post_media.post_id and p.status = 'published' and p.deleted_at is null)
  );

drop policy if exists "Company members can manage media of their posts" on public.commercial_post_media;
create policy "Company members can manage media of their posts"
  on public.commercial_post_media for all
  using (exists (select 1 from public.commercial_posts p where p.id = commercial_post_media.post_id and public.is_company_member(p.company_id)))
  with check (exists (select 1 from public.commercial_posts p where p.id = commercial_post_media.post_id and public.is_company_member(p.company_id)));

drop policy if exists "Anyone can view likes" on public.commercial_post_likes;
create policy "Anyone can view likes" on public.commercial_post_likes for select using (true);

drop policy if exists "Users can like posts as themselves" on public.commercial_post_likes;
create policy "Users can like posts as themselves" on public.commercial_post_likes for insert with check (user_id = auth.uid());

drop policy if exists "Users can unlike posts as themselves" on public.commercial_post_likes;
create policy "Users can unlike posts as themselves" on public.commercial_post_likes for delete using (user_id = auth.uid());

drop policy if exists "Anyone can view comments" on public.commercial_post_comments;
create policy "Anyone can view comments" on public.commercial_post_comments for select using (true);

drop policy if exists "Users can comment as themselves" on public.commercial_post_comments;
create policy "Users can comment as themselves" on public.commercial_post_comments for insert with check (user_id = auth.uid());

drop policy if exists "Users can edit their own comments" on public.commercial_post_comments;
create policy "Users can edit their own comments" on public.commercial_post_comments for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Users or company members can delete comments" on public.commercial_post_comments;
create policy "Users or company members can delete comments"
  on public.commercial_post_comments for delete using (
    user_id = auth.uid()
    or exists (select 1 from public.commercial_posts p where p.id = commercial_post_comments.post_id and public.is_company_member(p.company_id))
  );

drop policy if exists "Users can view their own bookmarks" on public.commercial_post_bookmarks;
create policy "Users can view their own bookmarks" on public.commercial_post_bookmarks for select using (user_id = auth.uid());

drop policy if exists "Users can bookmark as themselves" on public.commercial_post_bookmarks;
create policy "Users can bookmark as themselves" on public.commercial_post_bookmarks for insert with check (user_id = auth.uid());

drop policy if exists "Users can remove their own bookmarks" on public.commercial_post_bookmarks;
create policy "Users can remove their own bookmarks" on public.commercial_post_bookmarks for delete using (user_id = auth.uid());

drop policy if exists "Company members can view views stats" on public.commercial_post_views;
create policy "Company members can view views stats"
  on public.commercial_post_views for select using (
    exists (select 1 from public.commercial_posts p where p.id = commercial_post_views.post_id and public.is_company_member(p.company_id))
  );

drop policy if exists "Anyone can record a view" on public.commercial_post_views;
create policy "Anyone can record a view" on public.commercial_post_views for insert with check (true);

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
