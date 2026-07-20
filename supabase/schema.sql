-- ALSOUK — supplier directory schema.
-- Mirrors the existing production `public.suppliers` table that backs the
-- /suppliers directory. The app (lib/supabase/suppliers-service.ts) maps these
-- snake_case columns onto the Supplier type in lib/directory-data.ts:
--   company_name -> name, city -> cityKey, category -> categories[],
--   business_type -> businessTypes[], years_in_business -> years.
-- country/city are stored as English display names ("Tunisia", "Sfax") and
-- resolved to the app's keys at read time.

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
create index if not exists suppliers_category_idx on public.suppliers (category);
create index if not exists suppliers_verified_idx on public.suppliers (verified);
