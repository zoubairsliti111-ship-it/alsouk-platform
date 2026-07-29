-- ALSOUK — Marketplace schema foundation (multi-store B2B).
--
-- Adds the relational core for the marketplace vision on top of the existing
-- read-only `suppliers` directory and `rfqs` tables (both untouched here):
--
--   companies            a supplier organisation owned by an auth user
--   stores               a storefront belonging to a company (1..N per company)
--   categories           global, hierarchical product/company taxonomy
--   company_categories   which categories a company operates in (M:N)
--   products             catalogue items sold by a store
--   product_images       Storage-backed media for a product
--   product_categories   product ⇄ category tagging (M:N)
--
-- Conventions:
--   * UUID primary keys (gen_random_uuid()).
--   * created_at + updated_at on every table; updated_at maintained by trigger.
--   * RLS enabled on every table. Public can READ published catalogue data;
--     WRITES are restricted to the owning auth user (company.owner_id =
--     auth.uid()). The service-role key bypasses RLS for admin/back-office.
--   * Ownership is resolved through the company → store → product chain.
--   * Image rows are Storage-ready: they keep the bucket + object path plus an
--     optional resolved public URL.
--
-- Idempotent: safe to re-run (IF NOT EXISTS / DROP POLICY IF EXISTS / etc.).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared updated_at trigger helper.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- companies — a supplier organisation, owned by an authenticated user.
-- Optionally linked to an existing directory `suppliers` row for migration.
-- ---------------------------------------------------------------------------
create table if not exists public.companies (
  id           uuid        primary key default gen_random_uuid(),
  owner_id     uuid        references auth.users (id) on delete set null,
  supplier_id  uuid        references public.suppliers (id) on delete set null,
  name         text        not null,
  slug         text        not null unique,
  description  text,
  country      text,
  city         text,
  website      text,
  logo_url     text,
  verified     boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Ensure columns exist if public.companies table already existed before this migration was run
alter table public.companies add column if not exists owner_id uuid references auth.users (id) on delete set null;
alter table public.companies add column if not exists supplier_id uuid references public.suppliers (id) on delete set null;
alter table public.companies add column if not exists name text;
alter table public.companies add column if not exists slug text;
alter table public.companies add column if not exists description text;
alter table public.companies add column if not exists country text;
alter table public.companies add column if not exists city text;
alter table public.companies add column if not exists website text;
alter table public.companies add column if not exists logo_url text;
alter table public.companies add column if not exists verified boolean not null default false;
alter table public.companies add column if not exists created_at timestamptz not null default now();
alter table public.companies add column if not exists updated_at timestamptz not null default now();

-- Ensure non-null constraints and defaults are set correctly
alter table public.companies alter column name set not null;
alter table public.companies alter column slug set not null;
alter table public.companies alter column verified set default false;
alter table public.companies alter column verified set not null;
alter table public.companies alter column created_at set default now();
alter table public.companies alter column created_at set not null;
alter table public.companies alter column updated_at set default now();
alter table public.companies alter column updated_at set not null;

-- Ensure slug uniqueness constraint exists
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'companies_slug_key'
  ) then
    alter table public.companies add constraint companies_slug_key unique (slug);
  end if;
end;
$$;

create index if not exists companies_owner_id_idx on public.companies (owner_id);
create index if not exists companies_supplier_id_idx on public.companies (supplier_id);
create index if not exists companies_verified_idx on public.companies (verified);

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- stores — a storefront belonging to a company (a company may run several).
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- categories — global, hierarchical taxonomy (parent_id self-reference).
-- Managed by admins (service role); publicly readable.
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- company_categories — which categories a company operates in (M:N).
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- products — catalogue items sold by a store. company_id is denormalised from
-- the store for simpler ownership checks and cross-store queries.
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- product_images — Storage-backed media. Keeps the bucket + object path so the
-- app can build signed/public URLs; `url` caches a resolved public URL.
-- At most one primary image per product (enforced by a partial unique index).
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- product_categories — product ⇄ category tagging (M:N).
-- ---------------------------------------------------------------------------
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

-- ===========================================================================
-- Row Level Security
--
-- Model: catalogue data is publicly readable (marketplace browsing works with
-- the anon/publishable key). Writes are limited to the owning auth user, where
-- ownership flows company.owner_id = auth.uid() down through stores/products.
-- The service-role key bypasses RLS for admin/back-office tooling.
--
-- Note: while Supabase Auth isn't wired into the app yet, auth.uid() is NULL
-- for the anon key, so the owner write-policies simply grant nothing to the
-- public — safe by default until authentication lands.
-- ===========================================================================

-- companies ----------------------------------------------------------------
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

-- stores -------------------------------------------------------------------
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

-- categories ---------------------------------------------------------------
-- Public read; writes are admin-only (service role bypasses RLS), so no
-- insert/update/delete policies are defined for regular users.
alter table public.categories enable row level security;

drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable"
  on public.categories for select using (true);

-- company_categories -------------------------------------------------------
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

-- products -----------------------------------------------------------------
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

-- product_images -----------------------------------------------------------
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

-- product_categories -------------------------------------------------------
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
