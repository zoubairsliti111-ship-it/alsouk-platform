-- ALSOUK — Commercial Posts, Dependent Tables, and Storage Bucket Migration.
-- Adds `public.commercial_posts` (defensively with IF NOT EXISTS) and all dependent tables:
-- `commercial_post_media`, `commercial_post_likes`, `commercial_post_comments`,
-- `commercial_post_bookmarks`, and `commercial_post_views`.
-- Sets up indexes, Row-Level Security (RLS) policies, API grants, and the
-- 'commercial-posts' storage bucket with public-read and authenticated-insert/delete storage policies.
--
-- Idempotent: safe to re-run.

-- 1. Ensure set_updated_at trigger helper exists
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Adaptive authentication helper function (handles both simple owner model and company_members)
create or replace function public.is_company_member_adaptive(cid uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  has_owner_match boolean;
  has_member_match boolean := false;
  members_table_exists boolean;
begin
  -- Check direct owner first
  select exists (
    select 1 from public.companies c
    where c.id = cid and c.owner_id = auth.uid()
  ) into has_owner_match;

  if has_owner_match then
    return true;
  end if;

  -- Check if company_members table exists
  select exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'company_members'
  ) into members_table_exists;

  if members_table_exists then
    -- Dynamically execute query to avoid compile-time dependency if table is not fully cached yet
    execute 'select exists (select 1 from public.company_members where company_id = $1 and user_id = auth.uid())'
    into has_member_match
    using cid;
  end if;

  return has_member_match;
end;
$$;

-- 3. Create table public.commercial_posts
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

-- 4. Create table public.commercial_post_media
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

-- 5. Create table public.commercial_post_likes
create table if not exists public.commercial_post_likes (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.commercial_posts (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

-- 6. Create table public.commercial_post_comments
create table if not exists public.commercial_post_comments (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.commercial_posts (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  body       text        not null check (length(btrim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Create table public.commercial_post_bookmarks
create table if not exists public.commercial_post_bookmarks (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.commercial_posts (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

-- 8. Create table public.commercial_post_views
create table if not exists public.commercial_post_views (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.commercial_posts (id) on delete cascade,
  user_id    uuid        references auth.users (id) on delete set null,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- 9. Indexes for performance
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

-- 10. Triggers for updated_at
drop trigger if exists commercial_posts_set_updated_at on public.commercial_posts;
create trigger commercial_posts_set_updated_at
  before update on public.commercial_posts
  for each row execute function public.set_updated_at();

drop trigger if exists commercial_post_comments_set_updated_at on public.commercial_post_comments;
create trigger commercial_post_comments_set_updated_at
  before update on public.commercial_post_comments
  for each row execute function public.set_updated_at();

-- 11. Enable Row Level Security (RLS)
alter table public.commercial_posts enable row level security;
alter table public.commercial_post_media enable row level security;
alter table public.commercial_post_likes enable row level security;
alter table public.commercial_post_comments enable row level security;
alter table public.commercial_post_bookmarks enable row level security;
alter table public.commercial_post_views enable row level security;

-- Drop existing policies defensively
drop policy if exists "Anyone can view published posts" on public.commercial_posts;
drop policy if exists "Company members can view draft/any posts of their company" on public.commercial_posts;
drop policy if exists "Company members can insert posts" on public.commercial_posts;
drop policy if exists "Company members can update their posts" on public.commercial_posts;
drop policy if exists "Company members can delete their posts" on public.commercial_posts;

drop policy if exists "Anyone can view media of published posts" on public.commercial_post_media;
drop policy if exists "Company members can view all media of their posts" on public.commercial_post_media;
drop policy if exists "Company members can manage media of their posts" on public.commercial_post_media;

drop policy if exists "Anyone can view likes" on public.commercial_post_likes;
drop policy if exists "Users can like posts as themselves" on public.commercial_post_likes;
drop policy if exists "Users can unlike posts as themselves" on public.commercial_post_likes;

drop policy if exists "Anyone can view comments" on public.commercial_post_comments;
drop policy if exists "Users can comment as themselves" on public.commercial_post_comments;
drop policy if exists "Users can edit their own comments" on public.commercial_post_comments;
drop policy if exists "Users or company members can delete comments" on public.commercial_post_comments;

drop policy if exists "Users can view their own bookmarks" on public.commercial_post_bookmarks;
drop policy if exists "Users can bookmark as themselves" on public.commercial_post_bookmarks;
drop policy if exists "Users can remove their own bookmarks" on public.commercial_post_bookmarks;

drop policy if exists "Company members can view views stats" on public.commercial_post_views;
drop policy if exists "Anyone can record a view" on public.commercial_post_views;

-- 12. Define Policies
-- commercial_posts policies using adaptive auth helper
create policy "Anyone can view published posts"
  on public.commercial_posts
  for select
  using (status = 'published' and deleted_at is null);

create policy "Company members can view draft/any posts of their company"
  on public.commercial_posts
  for select
  using (public.is_company_member_adaptive(company_id));

create policy "Company members can insert posts"
  on public.commercial_posts
  for insert
  with check (public.is_company_member_adaptive(company_id));

create policy "Company members can update their posts"
  on public.commercial_posts
  for update
  using (public.is_company_member_adaptive(company_id))
  with check (public.is_company_member_adaptive(company_id));

create policy "Company members can delete their posts"
  on public.commercial_posts
  for delete
  using (public.is_company_member_adaptive(company_id));

-- commercial_post_media policies
create policy "Anyone can view media of published posts"
  on public.commercial_post_media
  for select
  using (
    exists (
      select 1 from public.commercial_posts p
      where p.id = commercial_post_media.post_id
        and p.status = 'published'
        and p.deleted_at is null
    )
  );

create policy "Company members can view all media of their posts"
  on public.commercial_post_media
  for select
  using (
    exists (
      select 1 from public.commercial_posts p
      where p.id = commercial_post_media.post_id
        and public.is_company_member_adaptive(p.company_id)
    )
  );

create policy "Company members can manage media of their posts"
  on public.commercial_post_media
  for all
  using (
    exists (
      select 1 from public.commercial_posts p
      where p.id = commercial_post_media.post_id
        and public.is_company_member_adaptive(p.company_id)
    )
  )
  with check (
    exists (
      select 1 from public.commercial_posts p
      where p.id = commercial_post_media.post_id
        and public.is_company_member_adaptive(p.company_id)
    )
  );

-- commercial_post_likes policies
create policy "Anyone can view likes"
  on public.commercial_post_likes
  for select
  using (true);

create policy "Users can like posts as themselves"
  on public.commercial_post_likes
  for insert
  with check (user_id = auth.uid());

create policy "Users can unlike posts as themselves"
  on public.commercial_post_likes
  for delete
  using (user_id = auth.uid());

-- commercial_post_comments policies
create policy "Anyone can view comments"
  on public.commercial_post_comments
  for select
  using (true);

create policy "Users can comment as themselves"
  on public.commercial_post_comments
  for insert
  with check (user_id = auth.uid());

create policy "Users can edit their own comments"
  on public.commercial_post_comments
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users or company members can delete comments"
  on public.commercial_post_comments
  for delete
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.commercial_posts p
      where p.id = commercial_post_comments.post_id
        and public.is_company_member_adaptive(p.company_id)
    )
  );

-- commercial_post_bookmarks policies
create policy "Users can view their own bookmarks"
  on public.commercial_post_bookmarks
  for select
  using (user_id = auth.uid());

create policy "Users can bookmark as themselves"
  on public.commercial_post_bookmarks
  for insert
  with check (user_id = auth.uid());

create policy "Users can remove their own bookmarks"
  on public.commercial_post_bookmarks
  for delete
  using (user_id = auth.uid());

-- commercial_post_views policies
create policy "Company members can view views stats"
  on public.commercial_post_views
  for select
  using (
    exists (
      select 1 from public.commercial_posts p
      where p.id = commercial_post_views.post_id
        and public.is_company_member_adaptive(p.company_id)
    )
  );

create policy "Anyone can record a view"
  on public.commercial_post_views
  for insert
  with check (true);

-- 13. GRANT privileges for all roles
grant select, insert, update, delete on
  public.commercial_posts,
  public.commercial_post_media,
  public.commercial_post_likes,
  public.commercial_post_comments,
  public.commercial_post_bookmarks,
  public.commercial_post_views
to anon, authenticated, service_role;

-- 14. Storage Bucket Setup
-- Ensure 'commercial-posts' bucket is registered in storage.buckets if the schema exists
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then
    insert into storage.buckets (id, name, public)
    values ('commercial-posts', 'commercial-posts', true)
    on conflict (id) do nothing;
  end if;
end
$$;

-- Ensure RLS is active on storage.objects if the table exists
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'objects') then
    alter table storage.objects enable row level security;
  end if;
end
$$;

-- Storage Policies for 'commercial-posts' bucket
drop policy if exists "Anyone can select from commercial posts bucket" on storage.objects;
create policy "Anyone can select from commercial posts bucket"
  on storage.objects
  for select
  using (bucket_id = 'commercial-posts');

drop policy if exists "Company members can upload files to commercial posts bucket" on storage.objects;
create policy "Company members can upload files to commercial posts bucket"
  on storage.objects
  for insert
  with check (
    bucket_id = 'commercial-posts'
    and auth.role() = 'authenticated'
    and (
      exists (
        select 1 from public.companies c
        where c.owner_id = auth.uid()
      )
      or (
        exists (
          select 1 from information_schema.tables
          where table_schema = 'public' and table_name = 'company_members'
        ) and exists (
          select 1 from public.company_members cm
          where cm.user_id = auth.uid()
        )
      )
    )
  );

drop policy if exists "Company members can update files in commercial posts bucket" on storage.objects;
create policy "Company members can update files in commercial posts bucket"
  on storage.objects
  for update
  using (
    bucket_id = 'commercial-posts'
    and auth.role() = 'authenticated'
    and (
      exists (
        select 1 from public.companies c
        where c.owner_id = auth.uid()
      )
      or (
        exists (
          select 1 from information_schema.tables
          where table_schema = 'public' and table_name = 'company_members'
        ) and exists (
          select 1 from public.company_members cm
          where cm.user_id = auth.uid()
        )
      )
    )
  );

drop policy if exists "Company members can delete files from commercial posts bucket" on storage.objects;
create policy "Company members can delete files from commercial posts bucket"
  on storage.objects
  for delete
  using (
    bucket_id = 'commercial-posts'
    and auth.role() = 'authenticated'
    and (
      exists (
        select 1 from public.companies c
        where c.owner_id = auth.uid()
      )
      or (
        exists (
          select 1 from information_schema.tables
          where table_schema = 'public' and table_name = 'company_members'
        ) and exists (
          select 1 from public.company_members cm
          where cm.user_id = auth.uid()
        )
      )
    )
  );
