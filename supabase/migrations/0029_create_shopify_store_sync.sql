-- ALSOUK — 0029: Tier 2 of "link an external e-commerce store".
--
-- Lets a merchant connect their existing Shopify store and pull their real
-- catalog into ALSOUK's own `products` / `product_images`, so imported
-- products behave exactly like products created in the Studio (search,
-- directory, RFQ, …).
--
-- Two parts:
--   1. `products.source` + `products.external_id` so a re-sync UPDATES the
--      previously imported row instead of creating a duplicate.
--   2. `company_store_integrations` — one row per company/provider holding
--      the Shopify shop domain and Admin API access token.
--
-- SECURITY — the access token:
--   The token is a bearer credential for the merchant's entire Shopify admin,
--   so it must never reach a browser. RLS lets a company manager see THAT an
--   integration exists (domain, sync status) but a column-level REVOKE keeps
--   `access_token` unreadable to the `anon` and `authenticated` roles. Only
--   the service role — i.e. our server-side route handlers — can read it.
--
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. Provenance columns on products.
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists source text not null default 'alsouk';

alter table public.products
  add column if not exists external_id text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_source_check'
  ) then
    alter table public.products
      add constraint products_source_check check (source in ('alsouk', 'shopify'));
  end if;
end
$$;

comment on column public.products.source is
  'Where this product came from: ''alsouk'' when created in the Studio, ''shopify'' when imported from a connected Shopify store.';
comment on column public.products.external_id is
  'Identifier of this product in the external system it was imported from. NULL for ALSOUK-native products.';

-- One imported product per (company, provider, external id) so re-syncs
-- update in place. Partial so ALSOUK-native rows (external_id null) are
-- unaffected.
create unique index if not exists products_company_source_external_id_idx
  on public.products (company_id, source, external_id)
  where external_id is not null;

create index if not exists products_source_idx on public.products (source);

-- ---------------------------------------------------------------------------
-- 2. company_store_integrations — the connection itself.
-- ---------------------------------------------------------------------------
create table if not exists public.company_store_integrations (
  id               uuid        primary key default gen_random_uuid(),
  company_id       uuid        not null references public.companies (id) on delete cascade,
  provider         text        not null check (provider in ('shopify')),
  shop_domain      text        not null,
  access_token     text        not null,
  last_sync_at     timestamptz,
  last_sync_status text        check (last_sync_status in ('success', 'partial', 'failed')),
  last_sync_error  text,
  synced_count     integer     not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (company_id, provider)
);

create index if not exists company_store_integrations_company_id_idx
  on public.company_store_integrations (company_id);

drop trigger if exists company_store_integrations_set_updated_at on public.company_store_integrations;
create trigger company_store_integrations_set_updated_at
  before update on public.company_store_integrations
  for each row execute function public.set_updated_at();

alter table public.company_store_integrations enable row level security;

-- No public read: an integration is private to the company that owns it.
drop policy if exists "Managers can read their store integrations" on public.company_store_integrations;
create policy "Managers can read their store integrations"
  on public.company_store_integrations for select
  using (public.is_company_manager(company_id));

drop policy if exists "Managers can manage their store integrations" on public.company_store_integrations;
create policy "Managers can manage their store integrations"
  on public.company_store_integrations for all
  using (public.is_company_manager(company_id))
  with check (public.is_company_manager(company_id));

-- Column-level lockdown of the secret. RLS decides which ROWS a manager can
-- see; this decides which COLUMNS — `access_token` is readable only by the
-- service role used by our server routes. A manager selecting `*` from the
-- client gets an insufficient-privilege error rather than the token.
revoke all on public.company_store_integrations from anon, authenticated;
grant select (
  id, company_id, provider, shop_domain, last_sync_at,
  last_sync_status, last_sync_error, synced_count, created_at, updated_at
) on public.company_store_integrations to authenticated;
grant delete on public.company_store_integrations to authenticated;

comment on column public.company_store_integrations.access_token is
  'Shopify Admin API access token. Service-role readable ONLY — never select this from a browser client.';
