-- ALSOUK — Production Infrastructure & Missing Buckets Fix.
-- This migration ensures that the public.commercial_posts table and all its dependent tables exist,
-- registers all 5 required storage buckets in storage.buckets, and establishes correct RLS
-- policies, storage policies, and api grants to prevent "Bucket not found" and table missing errors.
--
-- Idempotent: safe to re-run.

-- 1. Create public.commercial_posts table and dependent tables
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

-- 2. Create performance indexes if they don't exist
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

-- 3. Trigger for updated_at
drop trigger if exists commercial_posts_set_updated_at on public.commercial_posts;
create trigger commercial_posts_set_updated_at
  before update on public.commercial_posts
  for each row execute function public.set_updated_at();

drop trigger if exists commercial_post_comments_set_updated_at on public.commercial_post_comments;
create trigger commercial_post_comments_set_updated_at
  before update on public.commercial_post_comments
  for each row execute function public.set_updated_at();

-- 4. Enable Row Level Security (RLS) on tables
alter table public.commercial_posts enable row level security;
alter table public.commercial_post_media enable row level security;
alter table public.commercial_post_likes enable row level security;
alter table public.commercial_post_comments enable row level security;
alter table public.commercial_post_bookmarks enable row level security;
alter table public.commercial_post_views enable row level security;

-- 5. Establish RLS policies defensively (dropping beforehand)
drop policy if exists "Anyone can view published posts" on public.commercial_posts;
drop policy if exists "Company members can view draft/any posts of their company" on public.commercial_posts;
drop policy if exists "Company members can insert posts" on public.commercial_posts;
drop policy if exists "Company members can update their posts" on public.commercial_posts;
drop policy if exists "Company members can delete their posts" on public.commercial_posts;

create policy "Anyone can view published posts"
  on public.commercial_posts
  for select
  using (status = 'published' and deleted_at is null);

create policy "Company members can view draft/any posts of their company"
  on public.commercial_posts
  for select
  using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.commercial_posts.company_id
        and cm.user_id = auth.uid()
    )
  );

create policy "Company members can insert posts"
  on public.commercial_posts
  for insert
  with check (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.commercial_posts.company_id
        and cm.user_id = auth.uid()
    )
  );

create policy "Company members can update their posts"
  on public.commercial_posts
  for update
  using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.commercial_posts.company_id
        and cm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.commercial_posts.company_id
        and cm.user_id = auth.uid()
    )
  );

create policy "Company members can delete their posts"
  on public.commercial_posts
  for delete
  using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.commercial_posts.company_id
        and cm.user_id = auth.uid()
    )
  );

-- Dependent media policies
drop policy if exists "Anyone can view media of published posts" on public.commercial_post_media;
drop policy if exists "Company members can view all media of their posts" on public.commercial_post_media;
drop policy if exists "Company members can manage media of their posts" on public.commercial_post_media;

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
      join public.company_members cm on cm.company_id = p.company_id
      where p.id = commercial_post_media.post_id
        and cm.user_id = auth.uid()
    )
  );

create policy "Company members can manage media of their posts"
  on public.commercial_post_media
  for all
  using (
    exists (
      select 1 from public.commercial_posts p
      join public.company_members cm on cm.company_id = p.company_id
      where p.id = commercial_post_media.post_id
        and cm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.commercial_posts p
      join public.company_members cm on cm.company_id = p.company_id
      where p.id = commercial_post_media.post_id
        and cm.user_id = auth.uid()
    )
  );

-- Dependent likes policies
drop policy if exists "Anyone can view likes" on public.commercial_post_likes;
drop policy if exists "Users can like posts as themselves" on public.commercial_post_likes;
drop policy if exists "Users can unlike posts as themselves" on public.commercial_post_likes;

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

-- Dependent comments policies
drop policy if exists "Anyone can view comments" on public.commercial_post_comments;
drop policy if exists "Users can comment as themselves" on public.commercial_post_comments;
drop policy if exists "Users can edit their own comments" on public.commercial_post_comments;
drop policy if exists "Users or company members can delete comments" on public.commercial_post_comments;

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
      join public.company_members cm on cm.company_id = p.company_id
      where p.id = commercial_post_comments.post_id
        and cm.user_id = auth.uid()
    )
  );

-- Dependent bookmarks policies
drop policy if exists "Users can view their own bookmarks" on public.commercial_post_bookmarks;
drop policy if exists "Users can bookmark as themselves" on public.commercial_post_bookmarks;
drop policy if exists "Users can remove their own bookmarks" on public.commercial_post_bookmarks;

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

-- Dependent views policies
drop policy if exists "Company members can view views stats" on public.commercial_post_views;
drop policy if exists "Anyone can record a view" on public.commercial_post_views;

create policy "Company members can view views stats"
  on public.commercial_post_views
  for select
  using (
    exists (
      select 1 from public.commercial_posts p
      join public.company_members cm on cm.company_id = p.company_id
      where p.id = commercial_post_views.post_id
        and cm.user_id = auth.uid()
    )
  );

create policy "Anyone can record a view"
  on public.commercial_post_views
  for insert
  with check (true);

-- 6. Storage Buckets Configuration for ALSOUK
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('company-media', 'company-media', true),
  ('commercial-posts', 'commercial-posts', true),
  ('post-media', 'post-media', true),
  ('company-videos', 'company-videos', true)
on conflict (id) do nothing;

-- 7. Define storage policies defensively on storage.objects
drop policy if exists "Public select on ALSOUK buckets" on storage.objects;
drop policy if exists "Authenticated insert on ALSOUK buckets" on storage.objects;
drop policy if exists "Authenticated update on ALSOUK buckets" on storage.objects;
drop policy if exists "Authenticated delete on ALSOUK buckets" on storage.objects;

create policy "Public select on ALSOUK buckets"
  on storage.objects for select using (
    bucket_id in ('product-images', 'company-media', 'commercial-posts', 'post-media', 'company-videos')
  );

create policy "Authenticated insert on ALSOUK buckets"
  on storage.objects for insert to authenticated with check (
    bucket_id in ('product-images', 'company-media', 'commercial-posts', 'post-media', 'company-videos')
  );

create policy "Authenticated update on ALSOUK buckets"
  on storage.objects for update to authenticated using (
    bucket_id in ('product-images', 'company-media', 'commercial-posts', 'post-media', 'company-videos')
  );

create policy "Authenticated delete on ALSOUK buckets"
  on storage.objects for delete to authenticated using (
    bucket_id in ('product-images', 'company-media', 'commercial-posts', 'post-media', 'company-videos')
  );

-- 8. GRANT privileges for all roles
grant select, insert, update, delete on
  public.commercial_posts,
  public.commercial_post_media,
  public.commercial_post_likes,
  public.commercial_post_comments,
  public.commercial_post_bookmarks,
  public.commercial_post_views
to anon, authenticated, service_role;

-- 9. Seed initial commercial posts dynamically linked to existing companies
do $$
begin
  if not exists (select 1 from public.commercial_posts limit 1) then
    INSERT INTO public.commercial_posts (company_id, content, images, status, visibility, view_count, created_at)
    SELECT
      id,
      '🌍 SOUKI Updates: Just completed our newest harvest of premium organic Deglet Nour dates in Tozeur! Available now in wholesale bulk packaging (1kg, 5kg, 10kg export boxes). Contact us for pricing and shipping options to Europe and GCC.',
      ARRAY['/images/product-dates.png'],
      'published',
      'public',
      142,
      now() - interval '2 days'
    FROM public.companies WHERE slug = 'sahara-dates'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.commercial_posts (company_id, content, images, status, visibility, view_count, created_at)
    SELECT
      id,
      '🌿 Cold-pressed extra-virgin olive oil directly from Sfax. Acidity < 0.3%. Packaged in 750ml glass bottles and 5L tins. Ready for shipping. Request a custom quote today!',
      ARRAY['/images/product-oliveoil.png'],
      'published',
      'public',
      358,
      now() - interval '1 day'
    FROM public.companies WHERE slug = 'medina-olive'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.commercial_posts (company_id, content, images, status, visibility, view_count, created_at)
    SELECT
      id,
      '🧵 Carthage Textiles: New shipment of premium eco-friendly organic cotton yarns and heavy-duty technical fabrics arrived in Monastir today! Perfect for wholesale apparel brands.',
      ARRAY['/images/product-textiles.png'],
      'published',
      'public',
      97,
      now()
    FROM public.companies WHERE slug = 'carthage-textiles'
    ON CONFLICT DO NOTHING;
  end if;
end
$$;
