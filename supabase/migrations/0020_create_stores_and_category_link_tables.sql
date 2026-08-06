-- ALSOUK — 0020: Incremental verification of stores and link tables.
--
-- Note: Since `stores` and `company_categories` are already defined in
-- baseline migration 0002_create_marketplace.sql, we do NOT recreate them here.
-- Instead, we ensure the index on `stores(company_id)` and `stores(is_active)` exists, and that
-- RLS policies are updated correctly to leverage the updated `is_company_manager` helper.
--
-- Idempotent: safe to re-run.

create index if not exists stores_company_id_idx on public.stores (company_id);
create index if not exists stores_is_active_idx on public.stores (is_active);

-- Update RLS policies to use the new security definer helper functions from 0019
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

-- company_categories indexes and RLS updates
create index if not exists company_categories_company_id_idx on public.company_categories (company_id);
create index if not exists company_categories_category_id_idx on public.company_categories (category_id);

drop policy if exists "Owners can manage their company categories" on public.company_categories;
create policy "Owners can manage their company categories"
  on public.company_categories for all
  using (public.is_company_manager(company_id))
  with check (public.is_company_manager(company_id));
