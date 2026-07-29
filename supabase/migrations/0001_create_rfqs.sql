-- ALSOUK — supplier directory schema foundation.
-- Mirrors the existing production `public.suppliers` table that backs the
-- /suppliers directory.
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

-- ---------------------------------------------------------------------------
-- ALSOUK — RFQ (Request for Quote) submissions.
--
-- Buyers submit a quote request from a supplier's profile. Each row is linked
-- to the supplier it targets (supplier_id) and keeps a denormalised
-- supplier_name snapshot so the admin view stays readable even if the supplier
-- is later renamed or removed.
--
-- Security model (no end-user auth exists in the app):
--   * INSERT is allowed for the anon/publishable key so the public form works.
--   * SELECT has NO public policy — RFQs contain buyer PII (email/phone) and
--     must never be world-readable. The admin view reads them server-side with
--     the service-role key, which bypasses RLS.

create table if not exists public.rfqs (
  id                   uuid        primary key default gen_random_uuid(),
  supplier_id          uuid        references public.suppliers (id) on delete set null,
  supplier_name        text,
  company_name         text        not null,
  contact_person       text        not null,
  email                text        not null,
  phone                text        not null,
  country              text        not null,
  product_requested    text        not null,
  quantity             text        not null,
  target_price         text,
  delivery_destination text        not null,
  message              text        not null,
  status               text        not null default 'new'
                                    check (status in ('new', 'in_progress', 'closed')),
  created_at           timestamptz not null default now()
);

create index if not exists rfqs_supplier_id_idx on public.rfqs (supplier_id);
create index if not exists rfqs_created_at_idx on public.rfqs (created_at desc);

alter table public.rfqs enable row level security;

-- Anyone (anon/publishable key) may submit an RFQ, but only insert.
drop policy if exists "Anyone can submit an RFQ" on public.rfqs;
create policy "Anyone can submit an RFQ"
  on public.rfqs
  for insert
  with check (true);

-- Intentionally no SELECT/UPDATE/DELETE policy: reads happen server-side with
-- the service-role key (see app/api/admin/rfqs). Do NOT add a public select
-- policy — it would expose buyer contact details.
