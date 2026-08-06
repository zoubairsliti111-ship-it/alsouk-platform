-- ALSOUK — 0022: Add `store_id`, `company_id`, `slug`, `sku`, `unit`,
-- `stock_quantity`, `is_active` to the EXISTING public.products table
-- (today: supplier_id, category, image_url, stock_available). Additive
-- only — legacy columns are kept untouched.
--
-- SAFETY NOTE: production `products` currently has 0 rows (confirmed via
-- direct query), so there is NO backfill risk and NO existing data that
-- could violate a new constraint here.
--
-- ⚠️ OPEN DECISIONS FLAGGED PREVIOUSLY, RESOLVED HERE WITH A CONSERVATIVE
-- DEFAULT (please review before running on production):
--   * `stock_quantity` is left NULL rather than derived from the boolean
--     `stock_available` — converting true/false into an invented number
--     (e.g. true -> 999) would introduce fabricated data. Leave it null
--     until real inventory counts are entered.
--   * `category` (legacy free-text column) is left as-is and NOT migrated
--     into `product_categories` automatically — there is no data to migrate
--     since the table is empty, and the free-text column is preserved for
--     any old code path that might still read it.
--   * `store_id` and `company_id` are added as NULLABLE (not NOT NULL) even
--     though the historical design intended them as required, specifically
--     BECAUSE the table might already be in use by the time this runs in a
--     real deployment — a hard NOT NULL here would break any insert that
--     doesn't yet supply them. Tighten to NOT NULL only after confirming
--     (via application code changes, tracked separately) that every insert
--     path supplies both.
--
-- DEPENDS ON: 0020 (public.stores) for the `store_id` foreign key — run
-- 0022 AFTER 0020, or run 0020's `stores` table creation first (this file
-- itself only needs `stores` to exist for the FK, not `product_categories`).
--
-- Idempotent: safe to re-run.

alter table public.products add column if not exists store_id uuid references public.stores (id) on delete cascade;
alter table public.products add column if not exists company_id uuid references public.companies (id) on delete cascade;
alter table public.products add column if not exists slug text;
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists unit text;
alter table public.products add column if not exists stock_quantity integer check (stock_quantity is null or stock_quantity >= 0);
alter table public.products add column if not exists is_active boolean not null default true;
alter table public.products add column if not exists updated_at timestamptz not null default now();

-- min_order_quantity/currency/price/description/name already exist in
-- production with matching or compatible types — nothing to add for them.

create index if not exists products_store_id_idx on public.products (store_id);
create index if not exists products_company_id_idx on public.products (company_id);
create index if not exists products_is_active_idx on public.products (is_active);
create index if not exists products_created_at_idx on public.products (created_at desc);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- RLS: public read of active products, owners/managers can write (products
-- has RLS enabled today with zero policies, i.e. fully blocked — this adds
-- the missing policies without touching anything else).
alter table public.products enable row level security;

drop policy if exists "Active products are publicly readable" on public.products;
create policy "Active products are publicly readable"
  on public.products for select using (
    is_active or (company_id is not null and public.is_company_manager(company_id))
  );

drop policy if exists "Owners can insert products" on public.products;
create policy "Owners can insert products"
  on public.products for insert with check (
    company_id is not null and public.is_company_manager(company_id)
  );

drop policy if exists "Owners can update their products" on public.products;
create policy "Owners can update their products"
  on public.products for update using (
    company_id is not null and public.is_company_manager(company_id)
  ) with check (
    company_id is not null and public.is_company_manager(company_id)
  );

drop policy if exists "Owners can delete their products" on public.products;
create policy "Owners can delete their products"
  on public.products for delete using (
    company_id is not null and public.is_company_manager(company_id)
  );

-- ---------------------------------------------------------------------------
-- product_images — brand new table, no legacy conflict.
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
  created_at     timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images (product_id);
create unique index if not exists product_images_primary_unique_idx
  on public.product_images (product_id) where is_primary;

alter table public.product_images enable row level security;

drop policy if exists "Product images are publicly readable" on public.product_images;
create policy "Product images are publicly readable"
  on public.product_images for select using (true);

drop policy if exists "Owners can manage their product images" on public.product_images;
create policy "Owners can manage their product images"
  on public.product_images for all
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and p.company_id is not null
        and public.is_company_manager(p.company_id)
    )
  )
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and p.company_id is not null
        and public.is_company_manager(p.company_id)
    )
  );

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view product images bucket" on storage.objects;
create policy "Anyone can view product images bucket"
  on storage.objects for select using (bucket_id = 'product-images');

drop policy if exists "Company members can upload product images" on storage.objects;
create policy "Company members can upload product images"
  on storage.objects for insert to authenticated with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.company_members cm where cm.user_id = auth.uid())
  );

drop policy if exists "Company members can delete product images" on storage.objects;
create policy "Company members can delete product images"
  on storage.objects for delete to authenticated using (
    bucket_id = 'product-images'
    and exists (select 1 from public.company_members cm where cm.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- product_categories — product <-> category (M:N). Created here (rather than
-- in 0020) because its RLS policy needs products.company_id, added above in
-- this same file. Empty until curated.
-- ---------------------------------------------------------------------------
create table if not exists public.product_categories (
  id          uuid        primary key default gen_random_uuid(),
  product_id  uuid        not null references public.products (id) on delete cascade,
  category_id uuid        not null references public.categories (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (product_id, category_id)
);

create index if not exists product_categories_product_id_idx on public.product_categories (product_id);
create index if not exists product_categories_category_id_idx on public.product_categories (category_id);

alter table public.product_categories enable row level security;

drop policy if exists "Product categories are publicly readable" on public.product_categories;
create policy "Product categories are publicly readable"
  on public.product_categories for select using (true);

drop policy if exists "Owners can manage their product categories" on public.product_categories;
create policy "Owners can manage their product categories"
  on public.product_categories for all
  using (
    exists (
      select 1 from public.products p
      where p.id = product_categories.product_id
        and p.company_id is not null
        and public.is_company_manager(p.company_id)
    )
  )
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_categories.product_id
        and p.company_id is not null
        and public.is_company_manager(p.company_id)
    )
  );
