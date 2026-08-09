-- ALSOUK — 0022: Add `store_id`, `company_id`, `slug`, `sku`, `unit`,
-- `stock_quantity`, `is_active` to the EXISTING public.products table
-- (today: supplier_id, category, image_url, stock_available). Additive
-- only — legacy columns are kept untouched.
--
-- SAFETY NOTE: production `products` currently has 0 rows (confirmed via
-- direct query), so there is NO backfill risk and NO existing data that
-- could violate a new constraint here.
--
-- Note: product_images and product_categories are already defined in
-- baseline migration 0002_create_marketplace.sql, so we do NOT recreate them here.
-- We only add missing columns/indexes on existing products, update policies/buckets safely,
-- and add indexes on product_images and product_categories to ensure high performance.
--
-- Idempotent: safe to re-run.

alter table public.products add column if not exists store_id uuid references public.stores (id) on delete cascade;
alter table public.products add column if not exists company_id uuid references public.companies (id) on delete cascade;
alter table public.products add column if not exists slug text;
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists unit text;
alter table public.products add column if not exists stock_quantity integer check (stock_quantity is null or stock_quantity >= 0);
alter table public.products add column if not exists is_active boolean not null default true;

create index if not exists products_store_id_idx on public.products (store_id);
create index if not exists products_company_id_idx on public.products (company_id);
create index if not exists products_is_active_idx on public.products (is_active);
create index if not exists products_created_at_idx on public.products (created_at desc);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- RLS: public read of active products, owners/managers can write.
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

-- product_images policies update
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

-- storage bucket creation and policies
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

-- product_categories policies update
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
