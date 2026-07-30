-- ALSOUK — Centralized B2B Company Entity migration.
-- Updates the `public.companies` table and adds `company_members` and `company_media`
-- to enable the core B2B ownership/membership hierarchy.
--
-- Idempotent: safe to re-run (IF NOT EXISTS / DROP POLICY IF EXISTS / etc.).

-- 1. Create custom enum types if they don't exist
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

-- 2. Modify existing public.companies table defensively
-- Ensure required original columns exist (if not already defined in 0002_create_marketplace.sql)
create table if not exists public.companies (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null,
  slug         text        not null unique,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.companies add column if not exists supplier_id uuid references public.suppliers (id) on delete set null;
alter table public.companies add column if not exists tagline text;
alter table public.companies add column if not exists description text;
alter table public.companies add column if not exists logo_url text;
alter table public.companies add column if not exists banner_url text;

-- Digital Presence columns
alter table public.companies add column if not exists facebook_url text;
alter table public.companies add column if not exists instagram_url text;
alter table public.companies add column if not exists tiktok_url text;
alter table public.companies add column if not exists linkedin_url text;
alter table public.companies add column if not exists youtube_url text;

-- Website strategy
alter table public.companies add column if not exists website_url text;
alter table public.companies add column if not exists website_mode public.company_website_mode default 'alsouk'::public.company_website_mode;

-- Contact & location columns
alter table public.companies add column if not exists business_email text;
alter table public.companies add column if not exists phone_number text;
alter table public.companies add column if not exists whatsapp_number text;
alter table public.companies add column if not exists country text not null default 'TN';
alter table public.companies add column if not exists city text; -- Let's alter to ensure we can have nullable, but we'll default it or update
alter table public.companies add column if not exists postal_code text;
alter table public.companies add column if not exists street_address text;

-- Business classification
alter table public.companies add column if not exists business_type text;
alter table public.companies add column if not exists primary_industry text;
alter table public.companies add column if not exists year_established integer;
alter table public.companies add column if not exists company_size text;
alter table public.companies add column if not exists tax_identifier text;

-- Profile progress & verification
alter table public.companies add column if not exists profile_completion integer not null default 0;
alter table public.companies add column if not exists verified boolean not null default false;
alter table public.companies add column if not exists verification_tier public.company_verification_tier not null default 'basic'::public.company_verification_tier;
alter table public.companies add column if not exists verified_at timestamptz;
alter table public.companies add column if not exists license_document_url text;

-- Multilingual & Export Markets arrays
alter table public.companies add column if not exists supported_languages text[] not null default '{}'::text[];
alter table public.companies add column if not exists export_markets text[] not null default '{}'::text[];

-- Generic metadata
alter table public.companies add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Adjust city to not null if needed or allow it to be updated later
-- Since existing tables might have nulls or be empty, we keep columns flexible, but add indexes.
create index if not exists companies_website_mode_idx on public.companies (website_mode);
create index if not exists companies_verification_tier_idx on public.companies (verification_tier);
create index if not exists companies_supported_languages_idx on public.companies using gin (supported_languages);
create index if not exists companies_export_markets_idx on public.companies using gin (export_markets);

-- Ensure set_updated_at trigger exists
drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- 3. Core Architecture: Company Members (Decoupling User from Company)
create table if not exists public.company_members (
  id                    uuid                        primary key default gen_random_uuid(),
  company_id            uuid                        not null references public.companies (id) on delete cascade,
  user_id               uuid                        not null references auth.users (id) on delete cascade,
  role                  text                        not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at            timestamptz                 not null default now(),
  unique (company_id, user_id)
);

create index if not exists company_members_user_id_idx on public.company_members (user_id);
create index if not exists company_members_company_id_idx on public.company_members (company_id);

-- 4. Company Media
create table if not exists public.company_media (
  id                    uuid                        primary key default gen_random_uuid(),
  company_id            uuid                        not null references public.companies (id) on delete cascade,
  media_type            text                        not null check (media_type in ('factory_photo', 'product_gallery', 'video', 'certificate')),
  storage_bucket        text                        not null default 'company-media',
  storage_path          text                        not null,
  url                   text                        not null,
  caption               text,
  position              integer                     not null default 0,
  created_at            timestamptz                 not null default now()
);

create index if not exists company_media_company_id_idx on public.company_media (company_id);

-- 5. Row Level Security & Policies
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.company_media enable row level security;

-- Drop previous basic owner policies on companies if they exist
drop policy if exists "Companies are publicly readable" on public.companies;
drop policy if exists "Owners can insert their company" on public.companies;
drop policy if exists "Owners can update their company" on public.companies;
drop policy if exists "Owners can delete their company" on public.companies;

-- Companies read access: Publicly readable
create policy "Companies are publicly readable"
  on public.companies for select using (true);

-- Companies insert access: Any authenticated user can register a company (they will also become member)
-- RLS check to see if auth.uid() is not null
create policy "Authenticated users can insert a company"
  on public.companies for insert with check (auth.uid() is not null);

-- Companies update/delete access: Only owners/admins in public.company_members can update/delete
create policy "Owners and admins can update their company"
  on public.companies for update using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.companies.id
        and cm.user_id = auth.uid()
        and cm.role in ('owner', 'admin')
    )
  ) with check (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.companies.id
        and cm.user_id = auth.uid()
        and cm.role in ('owner', 'admin')
    )
  );

create policy "Owners can delete their company"
  on public.companies for delete using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.companies.id
        and cm.user_id = auth.uid()
        and cm.role = 'owner'
    )
  );

-- Company Members Policies
drop policy if exists "Members are publicly readable" on public.company_members;
create policy "Members are publicly readable"
  on public.company_members for select using (true);

drop policy if exists "Owners/admins can manage company members" on public.company_members;
create policy "Owners/admins can manage company members"
  on public.company_members for all using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.company_members.company_id
        and cm.user_id = auth.uid()
        and cm.role in ('owner', 'admin')
    )
  ) with check (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.company_members.company_id
        and cm.user_id = auth.uid()
        and cm.role in ('owner', 'admin')
    )
  );

-- Special insertion policy for the initial creator of a company membership
drop policy if exists "Creators can insert their own initial membership" on public.company_members;
create policy "Creators can insert their own initial membership"
  on public.company_members for insert with check (
    user_id = auth.uid()
  );

-- Company Media Policies
drop policy if exists "Company media is publicly readable" on public.company_media;
create policy "Company media is publicly readable"
  on public.company_media for select using (true);

drop policy if exists "Members can manage company media" on public.company_media;
create policy "Members can manage company media"
  on public.company_media for all using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.company_media.company_id
        and cm.user_id = auth.uid()
        and cm.role in ('owner', 'admin')
    )
  ) with check (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = public.company_media.company_id
        and cm.user_id = auth.uid()
        and cm.role in ('owner', 'admin')
    )
  );
