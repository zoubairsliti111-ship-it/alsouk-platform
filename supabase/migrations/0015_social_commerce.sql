-- ALSOUK — Social Commerce layer for companies.
--
-- Everything here belongs to a COMPANY (the single source of truth). Nothing
-- is attached to the legacy `suppliers` table. Ownership flows through
-- companies.owner_id, extended with a company_members team table so several
-- users can manage one company. A SECURITY DEFINER helper centralises the
-- "can this user act for this company?" check and is reused by every policy.
--
--   company_members   team membership (owner/admin/editor) for a company
--   posts             commercial posts published by a company
--   post_media        Storage-backed images/videos for a post
--   post_likes        one like per user per post (buyers included)
--   post_comments     comments on a post
--   company_follows   one follow per user per company
--   live_sessions     upcoming / live / ended live sessions
--
-- Conventions match 0002: UUID PKs, created_at/updated_at (+ trigger), RLS on
-- every table, public reads of published content, writes gated by ownership /
-- membership, service role bypasses RLS. Idempotent (safe to re-run).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Ownership model note.
--
-- The company profile fields (banner/cover, socials, phone, business_type, …)
-- and the `company_members` team table are created by migration
-- 0004_update_companies_schema.sql. This layer intentionally does NOT recreate
-- them — it reuses the companies architecture as the single source of truth
-- and only adds the social-commerce content tables below.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Permission helper. SECURITY DEFINER so it bypasses RLS (no recursion when a
-- company_members policy needs to consult company_members) and gives every
-- policy a single, consistent definition of "acts for this company".
-- ---------------------------------------------------------------------------
create or replace function public.is_company_member(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.companies c
    where c.id = cid and c.owner_id = auth.uid()
  ) or exists (
    select 1 from public.company_members m
    where m.company_id = cid and m.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Owner/admin manager check. SECURITY DEFINER so a policy on company_members
-- can ask "is the caller an owner/admin of this company?" without selecting
-- company_members under RLS (which would recurse).
-- ---------------------------------------------------------------------------
create or replace function public.is_company_manager(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.companies c
    where c.id = cid and c.owner_id = auth.uid()
  ) or exists (
    select 1 from public.company_members m
    where m.company_id = cid and m.user_id = auth.uid() and m.role in ('owner', 'admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- Fix the self-referential company_members "manage" policy from
-- 0004_update_companies_schema.sql. Its USING/WITH CHECK selected from
-- company_members inside a policy ON company_members, which Postgres rejects at
-- evaluation time with "infinite recursion detected in policy for relation
-- company_members" (42P17) — surfacing on any authenticated storage upload.
-- Recreated here with the SECURITY DEFINER helper: identical intent
-- (owners/admins manage their company's members), no recursion.
-- ---------------------------------------------------------------------------
drop policy if exists "Owners/admins can manage company members" on public.company_members;
create policy "Owners/admins can manage company members"
  on public.company_members for all
  using (public.is_company_manager(company_id))
  with check (public.is_company_manager(company_id));

-- ---------------------------------------------------------------------------
-- posts — commercial posts owned by a company.
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id            uuid        primary key default gen_random_uuid(),
  company_id    uuid        not null references public.companies (id) on delete cascade,
  author_id     uuid        references auth.users (id) on delete set null,
  body          text        not null default '',
  pinned        boolean     not null default false,
  like_count    integer     not null default 0,
  comment_count integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists posts_company_id_idx on public.posts (company_id);
create index if not exists posts_pinned_created_idx on public.posts (company_id, pinned desc, created_at desc);

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- post_media — Storage-backed media for a post (images + short videos).
-- ---------------------------------------------------------------------------
create table if not exists public.post_media (
  id             uuid        primary key default gen_random_uuid(),
  post_id        uuid        not null references public.posts (id) on delete cascade,
  storage_bucket text        not null default 'post-media',
  storage_path   text        not null,
  url            text,
  media_type     text        not null default 'image' check (media_type in ('image', 'video')),
  position       integer     not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists post_media_post_id_idx on public.post_media (post_id);

-- ---------------------------------------------------------------------------
-- post_likes — one like per user per post.
-- ---------------------------------------------------------------------------
create table if not exists public.post_likes (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.posts (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists post_likes_post_id_idx on public.post_likes (post_id);
create index if not exists post_likes_user_id_idx on public.post_likes (user_id);

-- ---------------------------------------------------------------------------
-- post_comments — comments on a post.
-- ---------------------------------------------------------------------------
create table if not exists public.post_comments (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.posts (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  body       text        not null check (length(btrim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists post_comments_post_id_idx on public.post_comments (post_id, created_at);

drop trigger if exists post_comments_set_updated_at on public.post_comments;
create trigger post_comments_set_updated_at
  before update on public.post_comments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- company_follows — one follow per user per company.
-- ---------------------------------------------------------------------------
create table if not exists public.company_follows (
  id         uuid        primary key default gen_random_uuid(),
  company_id uuid        not null references public.companies (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create index if not exists company_follows_company_id_idx on public.company_follows (company_id);
create index if not exists company_follows_user_id_idx on public.company_follows (user_id);

-- ---------------------------------------------------------------------------
-- live_sessions — upcoming / currently live / ended sessions for a company.
-- ---------------------------------------------------------------------------
create table if not exists public.live_sessions (
  id           uuid        primary key default gen_random_uuid(),
  company_id   uuid        not null references public.companies (id) on delete cascade,
  created_by   uuid        references auth.users (id) on delete set null,
  title        text        not null,
  status       text        not null default 'upcoming' check (status in ('upcoming', 'live', 'ended')),
  scheduled_at timestamptz,
  started_at   timestamptz,
  ended_at     timestamptz,
  viewer_count integer     not null default 0,
  replay_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists live_sessions_company_id_idx on public.live_sessions (company_id, status);

drop trigger if exists live_sessions_set_updated_at on public.live_sessions;
create trigger live_sessions_set_updated_at
  before update on public.live_sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Denormalised counters maintained by triggers (SECURITY DEFINER so the
-- counter update isn't blocked by the posts write-policy for a liker/commenter
-- who isn't a company member).
-- ---------------------------------------------------------------------------
create or replace function public.posts_bump_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists post_likes_count on public.post_likes;
create trigger post_likes_count
  after insert or delete on public.post_likes
  for each row execute function public.posts_bump_like_count();

create or replace function public.posts_bump_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists post_comments_count on public.post_comments;
create trigger post_comments_count
  after insert or delete on public.post_comments
  for each row execute function public.posts_bump_comment_count();

-- ===========================================================================
-- Row Level Security
-- ===========================================================================

-- company_members RLS is defined in 0004_update_companies_schema.sql.

-- posts --------------------------------------------------------------------
alter table public.posts enable row level security;

drop policy if exists "Posts are publicly readable" on public.posts;
create policy "Posts are publicly readable"
  on public.posts for select using (true);

drop policy if exists "Members insert posts" on public.posts;
create policy "Members insert posts"
  on public.posts for insert with check (public.is_company_member(company_id) and author_id = auth.uid());

drop policy if exists "Members update posts" on public.posts;
create policy "Members update posts"
  on public.posts for update using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));

drop policy if exists "Members delete posts" on public.posts;
create policy "Members delete posts"
  on public.posts for delete using (public.is_company_member(company_id));

-- post_media ---------------------------------------------------------------
alter table public.post_media enable row level security;

drop policy if exists "Post media publicly readable" on public.post_media;
create policy "Post media publicly readable"
  on public.post_media for select using (true);

drop policy if exists "Members manage post media" on public.post_media;
create policy "Members manage post media"
  on public.post_media for all using (
    exists (select 1 from public.posts p where p.id = post_media.post_id and public.is_company_member(p.company_id))
  ) with check (
    exists (select 1 from public.posts p where p.id = post_media.post_id and public.is_company_member(p.company_id))
  );

-- post_likes ---------------------------------------------------------------
alter table public.post_likes enable row level security;

drop policy if exists "Likes publicly readable" on public.post_likes;
create policy "Likes publicly readable"
  on public.post_likes for select using (true);

drop policy if exists "Users like as themselves" on public.post_likes;
create policy "Users like as themselves"
  on public.post_likes for insert with check (user_id = auth.uid());

drop policy if exists "Users remove own like" on public.post_likes;
create policy "Users remove own like"
  on public.post_likes for delete using (user_id = auth.uid());

-- post_comments ------------------------------------------------------------
alter table public.post_comments enable row level security;

drop policy if exists "Comments publicly readable" on public.post_comments;
create policy "Comments publicly readable"
  on public.post_comments for select using (true);

drop policy if exists "Users comment as themselves" on public.post_comments;
create policy "Users comment as themselves"
  on public.post_comments for insert with check (user_id = auth.uid());

drop policy if exists "Users edit own comment" on public.post_comments;
create policy "Users edit own comment"
  on public.post_comments for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Author or company removes comment" on public.post_comments;
create policy "Author or company removes comment"
  on public.post_comments for delete using (
    user_id = auth.uid()
    or exists (select 1 from public.posts p where p.id = post_comments.post_id and public.is_company_member(p.company_id))
  );

-- company_follows ----------------------------------------------------------
alter table public.company_follows enable row level security;

drop policy if exists "Follows publicly readable" on public.company_follows;
create policy "Follows publicly readable"
  on public.company_follows for select using (true);

drop policy if exists "Users follow as themselves" on public.company_follows;
create policy "Users follow as themselves"
  on public.company_follows for insert with check (user_id = auth.uid());

drop policy if exists "Users unfollow themselves" on public.company_follows;
create policy "Users unfollow themselves"
  on public.company_follows for delete using (user_id = auth.uid());

-- live_sessions ------------------------------------------------------------
alter table public.live_sessions enable row level security;

drop policy if exists "Live sessions publicly readable" on public.live_sessions;
create policy "Live sessions publicly readable"
  on public.live_sessions for select using (true);

drop policy if exists "Members create live" on public.live_sessions;
create policy "Members create live"
  on public.live_sessions for insert with check (public.is_company_member(company_id) and created_by = auth.uid());

drop policy if exists "Members update live" on public.live_sessions;
create policy "Members update live"
  on public.live_sessions for update using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));

drop policy if exists "Members delete live" on public.live_sessions;
create policy "Members delete live"
  on public.live_sessions for delete using (public.is_company_member(company_id));

-- ---------------------------------------------------------------------------
-- Automatically enroll a company's owner as an 'owner' member so the team
-- table is always consistent with companies.owner_id.
-- ---------------------------------------------------------------------------
create or replace function public.companies_enroll_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.owner_id is not null then
    insert into public.company_members (company_id, user_id, role)
    values (new.id, new.owner_id, 'owner')
    on conflict (company_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists companies_enroll_owner on public.companies;
create trigger companies_enroll_owner
  after insert or update of owner_id on public.companies
  for each row execute function public.companies_enroll_owner();

-- ===========================================================================
-- Storage buckets + object policies for post media and company videos.
-- Object paths are namespaced by company id: "{company_id}/{file}", so the
-- first path segment identifies the owning company for membership checks.
-- ===========================================================================
insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('company-videos', 'company-videos', true)
on conflict (id) do nothing;

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

-- ===========================================================================
-- GRANTs — table privileges for the API roles (RLS still governs rows).
-- ===========================================================================
grant select, insert, update, delete on
  public.company_members,
  public.posts,
  public.post_media,
  public.post_likes,
  public.post_comments,
  public.company_follows,
  public.live_sessions
to anon, authenticated, service_role;

-- Marketplace tables from 0002. Hosted Supabase grants these automatically, but
-- declaring them keeps the full schema portable for self-hosted / `db reset`.
-- RLS from 0002 still decides which rows each role may touch. Idempotent.
grant select, insert, update, delete on
  public.companies,
  public.stores,
  public.categories,
  public.company_categories,
  public.products,
  public.product_images,
  public.product_categories
to anon, authenticated, service_role;
