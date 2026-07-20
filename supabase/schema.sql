-- ALSOUK — supplier directory schema.
-- Run this in the Supabase SQL editor (or via the CLI) to create the table
-- that backs the /suppliers directory. Column names are snake_case and map to
-- the Supplier type in lib/directory-data.ts.

create table if not exists public.suppliers (
  id            text primary key,
  name          text        not null,
  monogram      text        not null,
  logo_color    text        not null default 'blue' check (logo_color in ('blue', 'green')),
  country       text        not null check (country in ('tn', 'ma', 'dz', 'eg', 'ly')),
  city_key      text        not null,
  region        text        not null check (region in ('capital', 'north', 'central', 'south', 'coastal')),
  verified      boolean     not null default false,
  rating        numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  reviews       integer     not null default 0 check (reviews >= 0),
  products      integer     not null default 0 check (products >= 0),
  years         integer     not null default 0 check (years >= 0),
  response_rate integer     not null default 0 check (response_rate between 0 and 100),
  min_moq       integer     not null default 0 check (min_moq >= 0),
  business_types text[]     not null default '{}',
  categories     text[]     not null default '{}',
  created_at    timestamptz not null default now()
);

-- The directory is a public, read-only catalogue. Enable RLS and allow anyone
-- (including the anon/publishable key) to read, but not to write.
alter table public.suppliers enable row level security;

drop policy if exists "Public suppliers are viewable by everyone" on public.suppliers;
create policy "Public suppliers are viewable by everyone"
  on public.suppliers
  for select
  using (true);

create index if not exists suppliers_country_idx on public.suppliers (country);
create index if not exists suppliers_region_idx on public.suppliers (region);
create index if not exists suppliers_verified_idx on public.suppliers (verified);
