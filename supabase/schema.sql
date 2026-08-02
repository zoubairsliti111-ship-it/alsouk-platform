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

-- ---------------------------------------------------------------------------
-- RFQ (Request for Quote) submissions. See supabase/migrations/0001_create_rfqs.sql
-- for the authoritative migration; this mirrors it for the full-schema view.
-- ---------------------------------------------------------------------------
create table if not exists public.rfqs (
  id                   uuid        primary key default gen_random_uuid(),
  supplier_id          uuid        references public.suppliers (id) on delete set null,
  company_id           uuid        references public.companies (id) on delete set null,
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

-- Public may INSERT an RFQ; reads are server-side via the service-role key.
alter table public.rfqs enable row level security;

drop policy if exists "Anyone can submit an RFQ" on public.rfqs;
create policy "Anyone can submit an RFQ"
  on public.rfqs
  for insert
  with check (true);

-- ===========================================================================
-- Marketplace foundation (multi-store B2B).
-- Authoritative migration: supabase/migrations/0002_create_marketplace.sql
-- This section mirrors that migration for the full-schema view.
-- ===========================================================================

create extension if not exists pgcrypto;

-- Shared updated_at trigger helper.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- companies — a supplier organisation, owned by an authenticated user.
create table if not exists public.companies (
  id           uuid        primary key default gen_random_uuid(),
  owner_id     uuid        references auth.users (id) on delete set null,
  supplier_id  uuid        references public.suppliers (id) on delete set null,
  name         text        not null,
  slug         text        not null unique,
  description  text,
  country      text,
  city         text,
  website       text,
  logo_url      text,
  verified     boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists companies_owner_id_idx on public.companies (owner_id);
create index if not exists companies_supplier_id_idx on public.companies (supplier_id);
create index if not exists companies_verified_idx on public.companies (verified);

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- stores — a storefront belonging to a company.
create table if not exists public.stores (
  id                  uuid        primary key default gen_random_uuid(),
  company_id          uuid        not null references public.companies (id) on delete cascade,
  name                text        not null,
  slug                text        not null unique,
  tagline             text,
  description         text,
  logo_url            text,
  banner_url          text,
  logo_storage_path   text,
  banner_storage_path text,
  theme               jsonb       not null default '{}'::jsonb,
  is_active           boolean     not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists stores_company_id_idx on public.stores (company_id);
create index if not exists stores_is_active_idx on public.stores (is_active);

drop trigger if exists stores_set_updated_at on public.stores;
create trigger stores_set_updated_at
  before update on public.stores
  for each row execute function public.set_updated_at();

-- categories — global, hierarchical taxonomy.
create table if not exists public.categories (
  id          uuid        primary key default gen_random_uuid(),
  parent_id   uuid        references public.categories (id) on delete set null,
  slug        text        not null unique,
  name        text        not null,
  description text,
  position    integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists categories_parent_id_idx on public.categories (parent_id);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- company_categories — company ⇄ category (M:N).
create table if not exists public.company_categories (
  id          uuid        primary key default gen_random_uuid(),
  company_id  uuid        not null references public.companies (id) on delete cascade,
  category_id uuid        not null references public.categories (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, category_id)
);

create index if not exists company_categories_company_id_idx on public.company_categories (company_id);
create index if not exists company_categories_category_id_idx on public.company_categories (category_id);

drop trigger if exists company_categories_set_updated_at on public.company_categories;
create trigger company_categories_set_updated_at
  before update on public.company_categories
  for each row execute function public.set_updated_at();

-- products — catalogue items sold by a store (company_id denormalised).
create table if not exists public.products (
  id                  uuid          primary key default gen_random_uuid(),
  store_id            uuid          not null references public.stores (id) on delete cascade,
  company_id          uuid          not null references public.companies (id) on delete cascade,
  name                text          not null,
  slug                text          not null,
  sku                 text,
  description         text,
  price               numeric(14, 2) check (price is null or price >= 0),
  currency            text          not null default 'USD',
  min_order_quantity  integer       not null default 1 check (min_order_quantity >= 1),
  unit                text,
  stock_quantity      integer       check (stock_quantity is null or stock_quantity >= 0),
  is_active           boolean       not null default true,
  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now(),
  unique (store_id, slug)
);

create index if not exists products_store_id_idx on public.products (store_id);
create index if not exists products_company_id_idx on public.products (company_id);
create index if not exists products_is_active_idx on public.products (is_active);
create index if not exists products_created_at_idx on public.products (created_at desc);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- product_images — Storage-backed media (bucket + object path + cached url).
create table if not exists public.product_images (
  id             uuid        primary key default gen_random_uuid(),
  product_id     uuid        not null references public.products (id) on delete cascade,
  storage_bucket text        not null default 'product-images',
  storage_path   text        not null,
  url            text,
  alt            text,
  position       integer     not null default 0,
  is_primary     boolean     not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images (product_id);
create unique index if not exists product_images_one_primary_idx
  on public.product_images (product_id)
  where is_primary;

drop trigger if exists product_images_set_updated_at on public.product_images;
create trigger product_images_set_updated_at
  before update on public.product_images
  for each row execute function public.set_updated_at();

-- product_categories — product ⇄ category (M:N).
create table if not exists public.product_categories (
  id          uuid        primary key default gen_random_uuid(),
  product_id  uuid        not null references public.products (id) on delete cascade,
  category_id uuid        not null references public.categories (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product_id, category_id)
);

create index if not exists product_categories_product_id_idx on public.product_categories (product_id);
create index if not exists product_categories_category_id_idx on public.product_categories (category_id);

drop trigger if exists product_categories_set_updated_at on public.product_categories;
create trigger product_categories_set_updated_at
  before update on public.product_categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — public read of catalogue; owner-scoped writes via
-- company.owner_id = auth.uid(). Service role bypasses RLS for admin tooling.
-- ---------------------------------------------------------------------------
alter table public.companies enable row level security;

drop policy if exists "Companies are publicly readable" on public.companies;
create policy "Companies are publicly readable"
  on public.companies for select using (true);

drop policy if exists "Owners can insert their company" on public.companies;
create policy "Owners can insert their company"
  on public.companies for insert with check (owner_id = auth.uid());

drop policy if exists "Owners can update their company" on public.companies;
create policy "Owners can update their company"
  on public.companies for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "Owners can delete their company" on public.companies;
create policy "Owners can delete their company"
  on public.companies for delete using (owner_id = auth.uid());

alter table public.stores enable row level security;

drop policy if exists "Active stores are publicly readable" on public.stores;
create policy "Active stores are publicly readable"
  on public.stores for select using (
    is_active
    or exists (
      select 1 from public.companies c
      where c.id = stores.company_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can insert stores" on public.stores;
create policy "Owners can insert stores"
  on public.stores for insert with check (
    exists (
      select 1 from public.companies c
      where c.id = stores.company_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can update their stores" on public.stores;
create policy "Owners can update their stores"
  on public.stores for update using (
    exists (
      select 1 from public.companies c
      where c.id = stores.company_id and c.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies c
      where c.id = stores.company_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can delete their stores" on public.stores;
create policy "Owners can delete their stores"
  on public.stores for delete using (
    exists (
      select 1 from public.companies c
      where c.id = stores.company_id and c.owner_id = auth.uid()
    )
  );

alter table public.categories enable row level security;

drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable"
  on public.categories for select using (true);

alter table public.company_categories enable row level security;

drop policy if exists "Company categories are publicly readable" on public.company_categories;
create policy "Company categories are publicly readable"
  on public.company_categories for select using (true);

drop policy if exists "Owners can manage their company categories" on public.company_categories;
create policy "Owners can manage their company categories"
  on public.company_categories for all using (
    exists (
      select 1 from public.companies c
      where c.id = company_categories.company_id and c.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies c
      where c.id = company_categories.company_id and c.owner_id = auth.uid()
    )
  );

alter table public.products enable row level security;

drop policy if exists "Active products are publicly readable" on public.products;
create policy "Active products are publicly readable"
  on public.products for select using (
    is_active
    or exists (
      select 1 from public.companies c
      where c.id = products.company_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can insert products" on public.products;
create policy "Owners can insert products"
  on public.products for insert with check (
    exists (
      select 1 from public.companies c
      where c.id = products.company_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can update their products" on public.products;
create policy "Owners can update their products"
  on public.products for update using (
    exists (
      select 1 from public.companies c
      where c.id = products.company_id and c.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies c
      where c.id = products.company_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can delete their products" on public.products;
create policy "Owners can delete their products"
  on public.products for delete using (
    exists (
      select 1 from public.companies c
      where c.id = products.company_id and c.owner_id = auth.uid()
    )
  );

alter table public.product_images enable row level security;

drop policy if exists "Product images are publicly readable" on public.product_images;
create policy "Product images are publicly readable"
  on public.product_images for select using (true);

drop policy if exists "Owners can manage their product images" on public.product_images;
create policy "Owners can manage their product images"
  on public.product_images for all using (
    exists (
      select 1
      from public.products p
      join public.companies c on c.id = p.company_id
      where p.id = product_images.product_id and c.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.products p
      join public.companies c on c.id = p.company_id
      where p.id = product_images.product_id and c.owner_id = auth.uid()
    )
  );

alter table public.product_categories enable row level security;

drop policy if exists "Product categories are publicly readable" on public.product_categories;
create policy "Product categories are publicly readable"
  on public.product_categories for select using (true);

drop policy if exists "Owners can manage their product categories" on public.product_categories;
create policy "Owners can manage their product categories"
  on public.product_categories for all using (
    exists (
      select 1
      from public.products p
      join public.companies c on c.id = p.company_id
      where p.id = product_categories.product_id and c.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.products p
      join public.companies c on c.id = p.company_id
      where p.id = product_categories.product_id and c.owner_id = auth.uid()
    )
  );
