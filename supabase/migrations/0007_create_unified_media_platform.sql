-- ALSOUK — Unified Media Platform Migration.
-- Adds the `public.platform_media` table, sets up indices, triggers, Row-Level Security (RLS) policies,
-- and configures the `platform-media` storage bucket with associated policies.
--
-- Idempotent: safe to re-run.

-- 1. Create table public.platform_media
create table if not exists public.platform_media (
  id             uuid        primary key default gen_random_uuid(),
  company_id     uuid        not null references public.companies (id) on delete cascade,
  media_type     text        not null check (media_type in ('logo', 'cover', 'product', 'post', 'video', 'certificate', 'document', 'future')),
  mime_type      text        not null,
  file_size      integer     not null check (file_size > 0),
  width          integer,
  height         integer,
  duration       numeric,    -- for videos
  storage_bucket text        not null default 'platform-media',
  storage_path   text        not null,
  public_url     text        not null,
  alt_text       text,
  caption        text,
  position       integer     not null default 0 check (position >= 0),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

-- 2. Indexes for performance
create index if not exists platform_media_company_id_idx on public.platform_media (company_id);
create index if not exists platform_media_media_type_idx on public.platform_media (media_type);
create index if not exists platform_media_deleted_at_idx on public.platform_media (deleted_at);
create index if not exists platform_media_created_at_idx on public.platform_media (created_at desc);

-- 3. Trigger for updated_at
drop trigger if exists platform_media_set_updated_at on public.platform_media;
create trigger platform_media_set_updated_at
  before update on public.platform_media
  for each row execute function public.set_updated_at();

-- 4. Enable Row Level Security (RLS)
alter table public.platform_media enable row level security;

-- Drop existing policies defensively
drop policy if exists "Anyone can select public platform media" on public.platform_media;
drop policy if exists "Company members can select platform media of their company" on public.platform_media;
drop policy if exists "Company members can insert platform media" on public.platform_media;
drop policy if exists "Company members can update their platform media" on public.platform_media;
drop policy if exists "Company members can delete their platform media" on public.platform_media;

-- 5. Policies
-- Public Select: Anyone can view public media that is not soft-deleted
-- We allow public select since logos, covers, product images, and posts are fully public.
create policy "Anyone can select public platform media"
  on public.platform_media
  for select
  using (deleted_at is null);

-- Company Member Select: Company members can view all media of their company
create policy "Company members can select platform media of their company"
  on public.platform_media
  for select
  using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.platform_media.company_id
        and cm.user_id = auth.uid()
    )
  );

-- Company Member Insert: Only verified company members can create media for their company
create policy "Company members can insert platform media"
  on public.platform_media
  for insert
  with check (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.platform_media.company_id
        and cm.user_id = auth.uid()
    )
  );

-- Company Member Update: Only verified company members can edit media of their company
create policy "Company members can update their platform media"
  on public.platform_media
  for update
  using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.platform_media.company_id
        and cm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.platform_media.company_id
        and cm.user_id = auth.uid()
    )
  );

-- Company Member Delete: Only verified company members can delete media of their company
create policy "Company members can delete their platform media"
  on public.platform_media
  for delete
  using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.platform_media.company_id
        and cm.user_id = auth.uid()
    )
  );

-- 6. Storage Bucket Configuration for Unified Platform Media
insert into storage.buckets (id, name, public)
values ('platform-media', 'platform-media', true)
on conflict (id) do nothing;

-- Storage Policies for 'platform-media' bucket
drop policy if exists "Anyone can select from platform media bucket" on storage.objects;
create policy "Anyone can select from platform media bucket"
  on storage.objects
  for select
  using (bucket_id = 'platform-media');

drop policy if exists "Company members can upload files to platform media bucket" on storage.objects;
create policy "Company members can upload files to platform media bucket"
  on storage.objects
  for insert
  with check (
    bucket_id = 'platform-media'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.company_members cm
      where cm.user_id = auth.uid()
    )
  );

drop policy if exists "Company members can delete files from platform media bucket" on storage.objects;
create policy "Company members can delete files from platform media bucket"
  on storage.objects
  for delete
  using (
    bucket_id = 'platform-media'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.company_members cm
      where cm.user_id = auth.uid()
    )
  );
