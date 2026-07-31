-- ALSOUK — Souk Exhibition Foundation Migration
--
-- Adds schema structure for the virtual exhibition platform.
--
-- Tables created:
--   exhibitions             An event organized with a name, cover, organizer, start/end date, etc.
--   exhibition_booths       A booth inside an exhibition, representing a company's presence.
--   exhibition_items        A virtual exhibit (Prototype, Machine, Innovation, Sample, Catalog Item) belonging specifically to a booth.
--   exhibition_media        Gallery images or video links attached specifically to a booth.
--   exhibition_documents    Catalog PDFs or brochures attached specifically to a booth.
--
-- Idempotent: safe to re-run (IF NOT EXISTS / DROP POLICY IF EXISTS / etc.).

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

-- ---------------------------------------------------------------------------
-- exhibition_booths — connects a company to an exhibition (NOT store)
-- ---------------------------------------------------------------------------
create table if not exists public.exhibition_booths (
  id             uuid        primary key default gen_random_uuid(),
  exhibition_id  uuid        not null references public.exhibitions (id) on delete cascade,
  company_id     uuid        not null references public.companies (id) on delete cascade,
  banner_url     text,
  description    text        not null, -- Exhibition-specific booth description
  is_archived    boolean     not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (exhibition_id, company_id)
);

create index if not exists exhibition_booths_exhibition_idx on public.exhibition_booths (exhibition_id);
create index if not exists exhibition_booths_company_idx on public.exhibition_booths (company_id);

drop trigger if exists exhibition_booths_set_updated_at on public.exhibition_booths;
create trigger exhibition_booths_set_updated_at
  before update on public.exhibition_booths
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- exhibition_items — booth exhibits (completely independent content type)
-- ---------------------------------------------------------------------------
create table if not exists public.exhibition_items (
  id             uuid        primary key default gen_random_uuid(),
  booth_id       uuid        not null references public.exhibition_booths (id) on delete cascade,
  name           text        not null,
  description    text,
  images         text[]      not null default '{}'::text[],
  videos         text[]      not null default '{}'::text[],
  pdf_url        text,
  brochure_url   text,
  is_featured    boolean     not null default false,
  sort_order     integer     not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists exhibition_items_booth_idx on public.exhibition_items (booth_id);

drop trigger if exists exhibition_items_set_updated_at on public.exhibition_items;
create trigger exhibition_items_set_updated_at
  before update on public.exhibition_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- exhibition_media — gallery and videos specifically for a booth
-- ---------------------------------------------------------------------------
create table if not exists public.exhibition_media (
  id             uuid        primary key default gen_random_uuid(),
  booth_id       uuid        not null references public.exhibition_booths (id) on delete cascade,
  media_type     text        not null, -- 'image' or 'video'
  url            text        not null,
  caption        text,
  sort_order     integer     not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists exhibition_media_booth_idx on public.exhibition_media (booth_id);

-- ---------------------------------------------------------------------------
-- exhibition_documents — catalog PDFs or brochures specifically for a booth
-- ---------------------------------------------------------------------------
create table if not exists public.exhibition_documents (
  id             uuid        primary key default gen_random_uuid(),
  booth_id       uuid        not null references public.exhibition_booths (id) on delete cascade,
  name           text        not null,
  url            text        not null,
  file_size      text,       -- e.g. "2.4 MB"
  sort_order     integer     not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists exhibition_documents_booth_idx on public.exhibition_documents (booth_id);


-- ===========================================================================
-- Row Level Security (RLS)
--
-- Exhibition module content is publicly readable (SELECT policies are set to true).
-- Writes/Updates are limited to admins/service-role (for this release, public can only select).
-- ===========================================================================

-- exhibitions
alter table public.exhibitions enable row level security;
drop policy if exists "Exhibitions are publicly readable" on public.exhibitions;
create policy "Exhibitions are publicly readable" on public.exhibitions for select using (true);

-- exhibition_booths
alter table public.exhibition_booths enable row level security;
drop policy if exists "Exhibition booths are publicly readable" on public.exhibition_booths;
create policy "Exhibition booths are publicly readable" on public.exhibition_booths for select using (true);

-- exhibition_items
alter table public.exhibition_items enable row level security;
drop policy if exists "Exhibition items are publicly readable" on public.exhibition_items;
create policy "Exhibition items are publicly readable" on public.exhibition_items for select using (true);

-- exhibition_media
alter table public.exhibition_media enable row level security;
drop policy if exists "Exhibition media are publicly readable" on public.exhibition_media;
create policy "Exhibition media are publicly readable" on public.exhibition_media for select using (true);

-- exhibition_documents
alter table public.exhibition_documents enable row level security;
drop policy if exists "Exhibition documents are publicly readable" on public.exhibition_documents;
create policy "Exhibition documents are publicly readable" on public.exhibition_documents for select using (true);
