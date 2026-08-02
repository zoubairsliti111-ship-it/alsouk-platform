-- ALSOUK — supplier directory table (baseline).
--
-- The `public.suppliers` table already exists in production (it predates the
-- migrations folder and lived only in supabase/schema.sql). This migration
-- brings it into the migration chain so the schema is reproducible from
-- migrations alone (needed by `supabase db reset` / local dev, and by 0001
-- which references it). It is idempotent (`create ... if not exists`), so it is
-- a no-op on the existing production database.

create table if not exists public.suppliers (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid,
  company_name      text        not null,
  description       text,
  country           text        not null,
  city              text        not null,
  category          text        not null,
  business_type     text        not null,
  years_in_business integer     not null default 0 check (years_in_business >= 0),
  verified          boolean     not null default false,
  rating            numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  response_rate     integer     not null default 0 check (response_rate between 0 and 100),
  logo_url          text,
  reviews           integer     not null default 0 check (reviews >= 0),
  products          integer     not null default 0 check (products >= 0),
  min_moq           integer     not null default 0 check (min_moq >= 0),
  region            text        not null,
  monogram          text,
  logo_color        text        default 'blue',
  created_at        timestamptz not null default now()
);

alter table public.suppliers enable row level security;

drop policy if exists "Public suppliers are viewable by everyone" on public.suppliers;
create policy "Public suppliers are viewable by everyone"
  on public.suppliers
  for select
  using (true);

create index if not exists suppliers_country_idx on public.suppliers (country);
create index if not exists suppliers_region_idx on public.suppliers (region);
create index if not exists suppliers_category_idx on public.suppliers (category);
create index if not exists suppliers_verified_idx on public.suppliers (verified);
