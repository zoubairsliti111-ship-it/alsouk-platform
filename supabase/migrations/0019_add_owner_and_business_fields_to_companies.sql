-- ALSOUK — 0019: Extended business fields and permissions helper functions for public.companies.
--
-- WHY: Ensures all required business, contact, location, and metadata columns exist on public.companies,
-- and registers public.is_company_member / public.is_company_manager permission helper functions safely.
--
-- Safety & Idempotency: Purely additive (ADD COLUMN IF NOT EXISTS). Re-runnable.
--
-- Note: Since company_members, company_media, and their RLS policies were already created in
-- baseline migration 0004_update_companies_schema.sql, this file does NOT recreate those tables or policies.
-- It only ensures any business-critical columns on companies exist and helper functions are defined/updated safely.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enum types (idempotent creation).
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'company_website_mode') then
    create type public.company_website_mode as enum ('external', 'alsouk', 'both');
  end if;
  if not exists (select 1 from pg_type where typname = 'company_verification_tier') then
    create type public.company_verification_tier as enum ('basic', 'verified', 'premium');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- companies: extended business fields (additive only).
-- ---------------------------------------------------------------------------
alter table public.companies add column if not exists website_url text;
alter table public.companies add column if not exists website_mode public.company_website_mode default 'alsouk'::public.company_website_mode;
alter table public.companies add column if not exists business_email text;
alter table public.companies add column if not exists phone_number text;
alter table public.companies add column if not exists whatsapp_number text;
alter table public.companies add column if not exists postal_code text;
alter table public.companies add column if not exists street_address text;

alter table public.companies add column if not exists primary_industry text;
alter table public.companies add column if not exists year_established integer;
alter table public.companies add column if not exists company_size text;
alter table public.companies add column if not exists tax_identifier text;

alter table public.companies add column if not exists profile_completion integer not null default 0;
alter table public.companies add column if not exists verification_tier public.company_verification_tier not null default 'basic'::public.company_verification_tier;
alter table public.companies add column if not exists verified_at timestamptz;
alter table public.companies add column if not exists license_document_url text;

alter table public.companies add column if not exists supported_languages text[] not null default '{}'::text[];
alter table public.companies add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Backfill new columns from existing equivalent legacy data (only where the
-- new column is still empty, so this never overwrites a real later update).
update public.companies set website_url    = website          where website_url    is null and website          is not null;
update public.companies set business_email = email            where business_email is null and email            is not null;
update public.companies set phone_number   = phone            where phone_number   is null and phone            is not null;
update public.companies set whatsapp_number = whatsapp        where whatsapp_number is null and whatsapp         is not null;
update public.companies set year_established = founded_year   where year_established is null and founded_year    is not null;
update public.companies set company_size   = employee_count   where company_size   is null and employee_count   is not null;

create index if not exists companies_website_mode_idx on public.companies (website_mode);
create index if not exists companies_verification_tier_idx on public.companies (verification_tier);
create index if not exists companies_supported_languages_idx on public.companies using gin (supported_languages);

-- ---------------------------------------------------------------------------
-- Permission helpers. Defined/Updated safely BEFORE any RLS policy uses them.
-- SECURITY DEFINER: bypasses RLS to avoid recursive policy evaluation.
-- ---------------------------------------------------------------------------
create or replace function public.is_company_member(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.companies c
    where c.id = cid and c.owner_id = auth.uid()
  ) or exists (
    select 1 from public.company_members m
    where m.company_id = cid and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_company_manager(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.companies c
    where c.id = cid and c.owner_id = auth.uid()
  ) or exists (
    select 1 from public.company_members m
    where m.company_id = cid and m.user_id = auth.uid() and m.role in ('owner', 'admin')
  );
$$;
