-- ALSOUK — 0048: saved_products — the "Save" button's real backing table.
--
-- The Save button on the product details page (components/marketplace/
-- product-details.tsx) was pure local useState, never persisted anywhere —
-- toggling it did nothing beyond a client-side re-render, reset on refresh.
-- No button existed at all on product-card.tsx.
--
-- Same shape as company_follows (0015): user_id/product_id pair, RLS scopes
-- every operation to the current user's own rows only.
--
-- Idempotent: safe to re-run.

create table if not exists public.saved_products (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists saved_products_user_id_idx on public.saved_products (user_id, created_at);

alter table public.saved_products enable row level security;

drop policy if exists "Users view their own saved products" on public.saved_products;
create policy "Users view their own saved products"
  on public.saved_products for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users save products as themselves" on public.saved_products;
create policy "Users save products as themselves"
  on public.saved_products for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users remove their own saved products" on public.saved_products;
create policy "Users remove their own saved products"
  on public.saved_products for delete
  to authenticated
  using (auth.uid() = user_id);

-- Explicit grant, not the schema default — this project has repeatedly
-- shipped tables where anon/authenticated grants silently didn't match
-- what RLS implied (0031, 0036, 0039, 0043). Only authenticated needs
-- access at all; nothing here is ever meant to be anon-readable.
grant select, insert, delete on public.saved_products to authenticated;
