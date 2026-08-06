-- ALSOUK — 0019: Ownership model + extended business fields for public.companies,
-- plus the `company_members` / `company_media` tables.
--
-- WHY: Re-implements the intent of historical 0002/0003/0004/0016 (never
-- successfully applied to production — see MASTER_MIGRATION_PLAN.md) as a
-- single new, additive migration that is safe against the CURRENT production
-- schema. Does not modify 0000-0017.
--
-- IMPROVEMENT OVER THE ORIGINAL HISTORY: the original 0004 introduced a
-- self-referential RLS policy on `company_members` that caused a documented
-- "infinite recursion" error (42P17), only fixed two migrations later by
-- 0015. Since this is a fresh migration (not a replay of history), the
-- SECURITY DEFINER helper functions are defined FIRST and used immediately —
-- the bug is never introduced in the first place.
--
-- SAFETY:
--   * All new columns are nullable or have safe defaults — no existing row
--     can violate a constraint.
--   * Backfills reuse existing equivalent data (website -> website_url,
--     email -> business_email, phone -> phone_number, whatsapp ->
--     whatsapp_number, founded_year -> year_established, employee_count ->
--     company_size) instead of leaving the new columns empty. Original
--     columns are left untouched.
--   * Depends on 0018 (assumes `companies.name` exists for readability of
--     comments only — not a hard SQL dependency, but should run after it).
--
-- Idempotent: safe to re-run.

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
-- companies: ownership + extended business fields (additive only).
-- ---------------------------------------------------------------------------
alter table public.companies add column if not exists owner_id uuid references auth.users (id) on delete set null;
alter table public.companies add column if not exists supplier_id uuid references public.suppliers (id) on delete set null;
alter table public.companies add column if not exists tagline text;

alter table public.companies add column if not exists facebook_url text;
alter table public.companies add column if not exists instagram_url text;
alter table public.companies add column if not exists tiktok_url text;
alter table public.companies add column if not exists linkedin_url text;
alter table public.companies add column if not exists youtube_url text;

alter table public.companies add column if not exists website_url text;
alter table public.companies add column if not exists website_mode public.company_website_mode not null default 'alsouk'::public.company_website_mode;

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

alter table public.companies
  add column if not exists profile_level text not null default 'starter'
  check (profile_level in ('starter', 'business', 'enterprise'));

-- `updated_at` did not exist on companies before this migration set
-- (production only had `created_at`). Required by the trigger below.
alter table public.companies add column if not exists updated_at timestamptz not null default now();

-- Backfill new columns from existing equivalent legacy data (only where the
-- new column is still empty, so this never overwrites a real later update).
update public.companies set website_url    = website          where website_url    is null and website          is not null;
update public.companies set business_email = email            where business_email is null and email            is not null;
update public.companies set phone_number   = phone            where phone_number   is null and phone            is not null;
update public.companies set whatsapp_number = whatsapp        where whatsapp_number is null and whatsapp         is not null;
update public.companies set year_established = founded_year   where year_established is null and founded_year    is not null;
update public.companies set company_size   = employee_count   where company_size   is null and employee_count   is not null;

create index if not exists companies_owner_id_idx on public.companies (owner_id);
create index if not exists companies_supplier_id_idx on public.companies (supplier_id);
create index if not exists companies_website_mode_idx on public.companies (website_mode);
create index if not exists companies_verification_tier_idx on public.companies (verification_tier);
create index if not exists companies_profile_level_idx on public.companies (profile_level);
create index if not exists companies_supported_languages_idx on public.companies using gin (supported_languages);

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- company_members — team membership (brand new table, no legacy conflict).
-- ---------------------------------------------------------------------------
create table if not exists public.company_members (
  id         uuid        primary key default gen_random_uuid(),
  company_id uuid        not null references public.companies (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  role       text        not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create index if not exists company_members_user_id_idx on public.company_members (user_id);
create index if not exists company_members_company_id_idx on public.company_members (company_id);

-- ---------------------------------------------------------------------------
-- company_media — brand new table, no legacy conflict.
-- ---------------------------------------------------------------------------
create table if not exists public.company_media (
  id             uuid        primary key default gen_random_uuid(),
  company_id     uuid        not null references public.companies (id) on delete cascade,
  media_type     text        not null check (media_type in ('factory_photo', 'product_gallery', 'video', 'certificate')),
  storage_bucket text        not null default 'company-media',
  storage_path   text        not null,
  url            text        not null,
  caption        text,
  position       integer     not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists company_media_company_id_idx on public.company_media (company_id);

-- ---------------------------------------------------------------------------
-- Permission helpers. Defined BEFORE any RLS policy uses them, so the
-- historical recursion bug (fixed in old 0015) never occurs here.
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

-- ---------------------------------------------------------------------------
-- Auto-enroll a company's owner_id as an 'owner' row in company_members, so
-- the team table stays consistent with companies.owner_id automatically.
-- ---------------------------------------------------------------------------
create or replace function public.companies_enroll_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.owner_id is not null then
    insert into public.company_members (company_id, user_id, role)
    values (new.id, new.owner_id, 'owner')
    on conflict (company_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists companies_enroll_owner on public.companies;
create trigger companies_enroll_owner
  after insert or update of owner_id on public.companies
  for each row execute function public.companies_enroll_owner();

-- ---------------------------------------------------------------------------
-- RLS: companies (replace read-blocking absence of policies with public
-- read + ownership-gated writes). Existing policies (there are none in
-- production today) are not being dropped destructively — this only adds.
-- ---------------------------------------------------------------------------
alter table public.companies enable row level security;

drop policy if exists "Companies are publicly readable" on public.companies;
create policy "Companies are publicly readable"
  on public.companies for select using (true);

drop policy if exists "Authenticated users can insert a company" on public.companies;
create policy "Authenticated users can insert a company"
  on public.companies for insert with check (auth.uid() is not null);

drop policy if exists "Owners and admins can update their company" on public.companies;
create policy "Owners and admins can update their company"
  on public.companies for update using (public.is_company_manager(id)) with check (public.is_company_manager(id));

drop policy if exists "Owners can delete their company" on public.companies;
create policy "Owners can delete their company"
  on public.companies for delete using (
    exists (select 1 from public.company_members cm where cm.company_id = companies.id and cm.user_id = auth.uid() and cm.role = 'owner')
  );

-- company_members RLS (non-recursive from the start — uses the helper above).
alter table public.company_members enable row level security;

drop policy if exists "Members are publicly readable" on public.company_members;
create policy "Members are publicly readable"
  on public.company_members for select using (true);

drop policy if exists "Owners/admins can manage company members" on public.company_members;
create policy "Owners/admins can manage company members"
  on public.company_members for all
  using (public.is_company_manager(company_id))
  with check (public.is_company_manager(company_id));

drop policy if exists "Creators can insert their own initial membership" on public.company_members;

-- company_media RLS.
alter table public.company_media enable row level security;

drop policy if exists "Company media is publicly readable" on public.company_media;
create policy "Company media is publicly readable"
  on public.company_media for select using (true);

drop policy if exists "Members can manage company media" on public.company_media;
create policy "Members can manage company media"
  on public.company_media for all
  using (public.is_company_manager(company_id))
  with check (public.is_company_manager(company_id));
