-- ALSOUK — Commercial Posts Foundation Migration.
-- Adds the `public.commercial_posts` table, sets up indices, Row-Level Security (RLS) policies,
-- and configures the `commercial-posts` storage bucket with associated policies.
--
-- Idempotent: safe to re-run.

-- 1. Create table public.commercial_posts
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

-- 2. Indexes for performance
create index if not exists commercial_posts_company_id_idx on public.commercial_posts (company_id);
create index if not exists commercial_posts_author_id_idx on public.commercial_posts (author_id);
create index if not exists commercial_posts_status_idx on public.commercial_posts (status);
create index if not exists commercial_posts_deleted_at_idx on public.commercial_posts (deleted_at);
create index if not exists commercial_posts_created_at_idx on public.commercial_posts (created_at desc);

-- 3. Trigger for updated_at
drop trigger if exists commercial_posts_set_updated_at on public.commercial_posts;
create trigger commercial_posts_set_updated_at
  before update on public.commercial_posts
  for each row execute function public.set_updated_at();

-- 4. Enable Row Level Security (RLS)
alter table public.commercial_posts enable row level security;

-- Drop existing policies defensively
drop policy if exists "Anyone can view published posts" on public.commercial_posts;
drop policy if exists "Company members can view draft/any posts of their company" on public.commercial_posts;
drop policy if exists "Company members can insert posts" on public.commercial_posts;
drop policy if exists "Company members can update their posts" on public.commercial_posts;
drop policy if exists "Company members can delete their posts" on public.commercial_posts;

-- 5. Policies
-- Public Select: Anyone can view published posts that are not soft-deleted
create policy "Anyone can view published posts"
  on public.commercial_posts
  for select
  using (status = 'published' and deleted_at is null);

-- Company Member Select: Company members can view all posts of their company (drafts, published, soft-deleted)
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

-- Company Member Insert: Only verified company members can create posts for their company
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

-- Company Member Update: Only verified company members can edit posts of their company
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

-- Company Member Delete: Only verified company members can delete posts of their company
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

-- 6. Storage Bucket Configuration for Commercial Posts Media
insert into storage.buckets (id, name, public)
values ('commercial-posts', 'commercial-posts', true)
on conflict (id) do nothing;

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
    and exists (
      select 1 from public.company_members cm
      where cm.user_id = auth.uid()
    )
  );

drop policy if exists "Company members can delete files from commercial posts bucket" on storage.objects;
create policy "Company members can delete files from commercial posts bucket"
  on storage.objects
  for delete
  using (
    bucket_id = 'commercial-posts'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.company_members cm
      where cm.user_id = auth.uid()
    )
  );

-- 7. Seed initial commercial posts linked to existing companies
-- Use an anonymous block to ensure we don't violate unique constraints if run multiple times
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
