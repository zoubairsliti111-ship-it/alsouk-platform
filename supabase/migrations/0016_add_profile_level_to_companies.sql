-- Migration to add profile_level to companies
-- Extensible B2B progressive account levels

alter table public.companies
  add column if not exists profile_level text not null default 'starter'
  check (profile_level in ('starter', 'business', 'enterprise'));

-- Index on profile_level for optimized lookups and filtering
create index if not exists companies_profile_level_idx on public.companies (profile_level);
