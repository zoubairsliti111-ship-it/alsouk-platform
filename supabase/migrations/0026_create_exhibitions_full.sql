-- ALSOUK — 0026: Exhibitions platform (brand new tables, no legacy
-- conflict). Merges the final combined shape of historical 0008-0014 into
-- one new file, since none of them ever applied to production — no need to
-- replay each incremental historical step separately.
--
-- Tables: exhibitions, exhibition_booths, exhibition_items,
-- exhibition_media, exhibition_documents, exhibition_applications.
--
-- DEPENDS ON: 0019 (public.companies.id — already existed regardless, but
-- ordered after 0019 for consistency with the rest of this plan).
--
-- Idempotent: safe to re-run.

create table if not exists public.exhibitions (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null,
  slug         text        not null unique,
  organizer    text        not null,
  description  text,
  cover_url    text,
  country      text        not null default 'TN',
  city         text        not null,
  start_date   timestamptz not null,
  end_date     timestamptz not null,
  categories   text[]      not null default '{}'::text[],
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists exhibitions_slug_idx on public.exhibitions (slug);
create index if not exists exhibitions_dates_idx on public.exhibitions (start_date, end_date);

drop trigger if exists exhibitions_set_updated_at on public.exhibitions;
create trigger exhibitions_set_updated_at
  before update on public.exhibitions
  for each row execute function public.set_updated_at();

create table if not exists public.exhibition_booths (
  id                uuid        primary key default gen_random_uuid(),
  exhibition_id     uuid        not null references public.exhibitions (id) on delete cascade,
  company_id        uuid        not null references public.companies (id) on delete cascade,
  banner_url        text,
  logo_url          text,
  description       text        not null,
  booth_number       text,
  category          text,
  is_featured       boolean     not null default false,
  is_archived       boolean     not null default false,
  status            text        not null default 'Draft' check (status in ('Draft', 'Submitted', 'Published', 'Archived')),
  title             text,
  short_description text,
  contact_person    text,
  contact_phone     text,
  contact_whatsapp  text,
  contact_email     text,
  contact_website   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (exhibition_id, company_id)
);

create index if not exists exhibition_booths_exhibition_idx on public.exhibition_booths (exhibition_id);
create index if not exists exhibition_booths_company_idx on public.exhibition_booths (company_id);

drop trigger if exists exhibition_booths_set_updated_at on public.exhibition_booths;
create trigger exhibition_booths_set_updated_at
  before update on public.exhibition_booths
  for each row execute function public.set_updated_at();

create table if not exists public.exhibition_items (
  id                uuid        primary key default gen_random_uuid(),
  booth_id          uuid        not null references public.exhibition_booths (id) on delete cascade,
  name              text        not null,
  description       text,
  short_description text,
  category          text,
  images            text[]      not null default '{}'::text[],
  videos            text[]      not null default '{}'::text[],
  pdf_url           text,
  brochure_url      text,
  is_featured       boolean     not null default false,
  sort_order        integer     not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists exhibition_items_booth_idx on public.exhibition_items (booth_id);

drop trigger if exists exhibition_items_set_updated_at on public.exhibition_items;
create trigger exhibition_items_set_updated_at
  before update on public.exhibition_items
  for each row execute function public.set_updated_at();

create table if not exists public.exhibition_media (
  id           uuid        primary key default gen_random_uuid(),
  booth_id     uuid        not null references public.exhibition_booths (id) on delete cascade,
  media_type   text        not null,
  url          text        not null,
  thumbnail_url text,
  caption      text,
  is_cover     boolean     not null default false,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists exhibition_media_booth_idx on public.exhibition_media (booth_id);

create table if not exists public.exhibition_documents (
  id          uuid        primary key default gen_random_uuid(),
  booth_id    uuid        not null references public.exhibition_booths (id) on delete cascade,
  name        text        not null,
  url         text        not null,
  file_size   text,
  language    text,
  description text,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists exhibition_documents_booth_idx on public.exhibition_documents (booth_id);

create table if not exists public.exhibition_applications (
  id                uuid        primary key default gen_random_uuid(),
  exhibition_id     uuid        not null references public.exhibitions (id) on delete cascade,
  company_id        uuid        references public.companies (id) on delete set null,
  company_name      text        not null,
  contact_person    text        not null,
  email             text        not null,
  phone             text        not null,
  country           text        not null default 'TN',
  business_category text        not null,
  short_description text        not null,
  message           text,
  status            text        not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  review_notes      text,
  submitted_at      timestamptz not null default now(),
  reviewed_at       timestamptz,
  reviewed_by       uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists exhibition_applications_exhibition_idx on public.exhibition_applications (exhibition_id);
create index if not exists exhibition_applications_company_idx on public.exhibition_applications (company_id);
create index if not exists exhibition_applications_status_idx on public.exhibition_applications (status);
create index if not exists exhibition_applications_created_idx on public.exhibition_applications (created_at);

drop trigger if exists exhibition_applications_set_updated_at on public.exhibition_applications;
create trigger exhibition_applications_set_updated_at
  before update on public.exhibition_applications
  for each row execute function public.set_updated_at();

-- RLS: exhibition content is publicly readable; applications/booths allow
-- public insert/update as designed historically (organizer review flow with
-- no separate admin auth layer yet — same trade-off the original 0009/0014
-- made; flagged here, not silently changed, since fixing it is a product
-- decision, not a migration concern).
alter table public.exhibitions enable row level security;
drop policy if exists "Exhibitions are publicly readable" on public.exhibitions;
create policy "Exhibitions are publicly readable" on public.exhibitions for select using (true);

alter table public.exhibition_booths enable row level security;
drop policy if exists "Exhibition booths are publicly readable" on public.exhibition_booths;
create policy "Exhibition booths are publicly readable" on public.exhibition_booths for select using (true);
drop policy if exists "Enable public insert for exhibition booths" on public.exhibition_booths;
create policy "Enable public insert for exhibition booths" on public.exhibition_booths for insert with check (true);
drop policy if exists "Enable public update for exhibition booths" on public.exhibition_booths;
create policy "Enable public update for exhibition booths" on public.exhibition_booths for update using (true) with check (true);

alter table public.exhibition_items enable row level security;
drop policy if exists "Exhibition items are publicly readable" on public.exhibition_items;
create policy "Exhibition items are publicly readable" on public.exhibition_items for select using (true);

alter table public.exhibition_media enable row level security;
drop policy if exists "Exhibition media are publicly readable" on public.exhibition_media;
create policy "Exhibition media are publicly readable" on public.exhibition_media for select using (true);

alter table public.exhibition_documents enable row level security;
drop policy if exists "Exhibition documents are publicly readable" on public.exhibition_documents;
create policy "Exhibition documents are publicly readable" on public.exhibition_documents for select using (true);

alter table public.exhibition_applications enable row level security;
drop policy if exists "Enable public insert for exhibition applications" on public.exhibition_applications;
create policy "Enable public insert for exhibition applications" on public.exhibition_applications for insert with check (true);
drop policy if exists "Enable public select for exhibition applications" on public.exhibition_applications;
create policy "Enable public select for exhibition applications" on public.exhibition_applications for select using (true);
drop policy if exists "Enable public update for exhibition applications" on public.exhibition_applications;
create policy "Enable public update for exhibition applications" on public.exhibition_applications for update using (true) with check (true);
