-- ALSOUK — 0020: `stores` table + `company_categories` / `product_categories`
-- link tables. All three are brand new — no legacy conflict exists for any
-- of them in production, so this is a direct, safe creation (equivalent to
-- the historical 0002 intent, but as a new independent file).
--
-- DEPENDS ON: 0019 (companies.owner_id, is_company_manager/is_company_member).
-- MUST RUN BEFORE: 0022 (products.store_id references public.stores).
--
-- Idempotent: safe to re-run.

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

alter table public.stores enable row level security;

drop policy if exists "Active stores are publicly readable" on public.stores;
create policy "Active stores are publicly readable"
  on public.stores for select using (is_active or public.is_company_manager(company_id));

drop policy if exists "Owners can insert stores" on public.stores;
create policy "Owners can insert stores"
  on public.stores for insert with check (public.is_company_manager(company_id));

drop policy if exists "Owners can update their stores" on public.stores;
create policy "Owners can update their stores"
  on public.stores for update using (public.is_company_manager(company_id)) with check (public.is_company_manager(company_id));

drop policy if exists "Owners can delete their stores" on public.stores;
create policy "Owners can delete their stores"
  on public.stores for delete using (public.is_company_manager(company_id));

-- ---------------------------------------------------------------------------
-- company_categories — company <-> category (M:N). Empty until curated.
-- ---------------------------------------------------------------------------
create table if not exists public.company_categories (
  id          uuid        primary key default gen_random_uuid(),
  company_id  uuid        not null references public.companies (id) on delete cascade,
  category_id uuid        not null references public.categories (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (company_id, category_id)
);

create index if not exists company_categories_company_id_idx on public.company_categories (company_id);
create index if not exists company_categories_category_id_idx on public.company_categories (category_id);

alter table public.company_categories enable row level security;

drop policy if exists "Company categories are publicly readable" on public.company_categories;
create policy "Company categories are publicly readable"
  on public.company_categories for select using (true);

drop policy if exists "Owners can manage their company categories" on public.company_categories;
create policy "Owners can manage their company categories"
  on public.company_categories for all
  using (public.is_company_manager(company_id))
  with check (public.is_company_manager(company_id));

-- NOTE: `product_categories` (product <-> category M:N) is intentionally
-- created in migration 0022 instead of here — its RLS policy needs
-- `products.company_id`, which only exists after 0022 runs. Creating it in
-- 0020 would force an awkward ordering (0020 before AND after 0022). See
-- 0022_extend_products_for_new_schema.sql.
