-- ALSOUK — 0027: Social commerce layer (public.posts, post_media,
-- post_likes, post_comments, company_follows, live_sessions). Re-implements
-- the intent of historical 0015 (never applied) as a new, independent file.
--
-- NOTE: unlike the historical 0015, this file does NOT need to "fix" a
-- recursion bug — the is_company_member/is_company_manager helpers were
-- already defined correctly in 0019, so no buggy policy was ever introduced
-- here. This file can therefore run any time after 0019 (no urgency window).
--
-- ⚠️ SEE 0024's note: this creates a SECOND, parallel "posts" implementation
-- alongside commercial_posts (0024) because both exist in the current
-- codebase (lib/services/posts-service.ts vs lib/services/social-service.ts).
-- This migration does not decide which one the product should keep — that
-- is a code-level decision to make separately.
--
-- DEPENDS ON: 0019 (companies.owner_id, company_members, is_company_member,
-- is_company_manager, set_updated_at trigger function).
--
-- Idempotent: safe to re-run.

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

create table if not exists public.post_likes (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.posts (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists post_likes_post_id_idx on public.post_likes (post_id);
create index if not exists post_likes_user_id_idx on public.post_likes (user_id);

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

create table if not exists public.company_follows (
  id         uuid        primary key default gen_random_uuid(),
  company_id uuid        not null references public.companies (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create index if not exists company_follows_company_id_idx on public.company_follows (company_id);
create index if not exists company_follows_user_id_idx on public.company_follows (user_id);

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

-- Denormalised counters maintained by triggers (SECURITY DEFINER so a
-- liker/commenter who isn't a company member isn't blocked by the posts
-- write-policy when the counter itself updates).
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

-- RLS ------------------------------------------------------------------
alter table public.posts enable row level security;
drop policy if exists "Posts are publicly readable" on public.posts;
create policy "Posts are publicly readable" on public.posts for select using (true);
drop policy if exists "Members insert posts" on public.posts;
create policy "Members insert posts" on public.posts for insert with check (public.is_company_member(company_id) and author_id = auth.uid());
drop policy if exists "Members update posts" on public.posts;
create policy "Members update posts" on public.posts for update using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
drop policy if exists "Members delete posts" on public.posts;
create policy "Members delete posts" on public.posts for delete using (public.is_company_member(company_id));

alter table public.post_media enable row level security;
drop policy if exists "Post media publicly readable" on public.post_media;
create policy "Post media publicly readable" on public.post_media for select using (true);
drop policy if exists "Members manage post media" on public.post_media;
create policy "Members manage post media"
  on public.post_media for all
  using (exists (select 1 from public.posts p where p.id = post_media.post_id and public.is_company_member(p.company_id)))
  with check (exists (select 1 from public.posts p where p.id = post_media.post_id and public.is_company_member(p.company_id)));

alter table public.post_likes enable row level security;
drop policy if exists "Likes publicly readable" on public.post_likes;
create policy "Likes publicly readable" on public.post_likes for select using (true);
drop policy if exists "Users like as themselves" on public.post_likes;
create policy "Users like as themselves" on public.post_likes for insert with check (user_id = auth.uid());
drop policy if exists "Users remove own like" on public.post_likes;
create policy "Users remove own like" on public.post_likes for delete using (user_id = auth.uid());

alter table public.post_comments enable row level security;
drop policy if exists "Comments publicly readable" on public.post_comments;
create policy "Comments publicly readable" on public.post_comments for select using (true);
drop policy if exists "Users comment as themselves" on public.post_comments;
create policy "Users comment as themselves" on public.post_comments for insert with check (user_id = auth.uid());
drop policy if exists "Users edit own comment" on public.post_comments;
create policy "Users edit own comment" on public.post_comments for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Author or company removes comment" on public.post_comments;
create policy "Author or company removes comment"
  on public.post_comments for delete using (
    user_id = auth.uid()
    or exists (select 1 from public.posts p where p.id = post_comments.post_id and public.is_company_member(p.company_id))
  );

alter table public.company_follows enable row level security;
drop policy if exists "Follows publicly readable" on public.company_follows;
create policy "Follows publicly readable" on public.company_follows for select using (true);
drop policy if exists "Users follow as themselves" on public.company_follows;
create policy "Users follow as themselves" on public.company_follows for insert with check (user_id = auth.uid());
drop policy if exists "Users unfollow themselves" on public.company_follows;
create policy "Users unfollow themselves" on public.company_follows for delete using (user_id = auth.uid());

alter table public.live_sessions enable row level security;
drop policy if exists "Live sessions publicly readable" on public.live_sessions;
create policy "Live sessions publicly readable" on public.live_sessions for select using (true);
drop policy if exists "Members create live" on public.live_sessions;
create policy "Members create live" on public.live_sessions for insert with check (public.is_company_member(company_id) and created_by = auth.uid());
drop policy if exists "Members update live" on public.live_sessions;
create policy "Members update live" on public.live_sessions for update using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
drop policy if exists "Members delete live" on public.live_sessions;
create policy "Members delete live" on public.live_sessions for delete using (public.is_company_member(company_id));

-- Storage buckets for social media -------------------------------------
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
