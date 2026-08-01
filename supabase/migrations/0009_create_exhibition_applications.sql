-- ALSOUK — Exhibition Applications Migration
--
-- Adds the `exhibition_applications` table for the "Apply to Exhibit" system.
--
-- Idempotent: safe to re-run.

create table if not exists public.exhibition_applications (
  id                 uuid        primary key default gen_random_uuid(),
  exhibition_id      uuid        not null references public.exhibitions (id) on delete cascade,
  company_id         uuid        references public.companies (id) on delete set null,
  company_name       text        not null,
  contact_person     text        not null,
  email              text        not null,
  phone              text        not null,
  country            text        not null default 'TN',
  business_category  text        not null,
  short_description  text        not null,
  message            text,
  status             text        not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  review_notes       text,
  submitted_at       timestamptz not null default now(),
  reviewed_at        timestamptz,
  reviewed_by        uuid,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Indexes
create index if not exists exhibition_applications_exhibition_idx on public.exhibition_applications (exhibition_id);
create index if not exists exhibition_applications_company_idx on public.exhibition_applications (company_id);
create index if not exists exhibition_applications_status_idx on public.exhibition_applications (status);
create index if not exists exhibition_applications_created_idx on public.exhibition_applications (created_at);

-- Set updated_at trigger
drop trigger if exists exhibition_applications_set_updated_at on public.exhibition_applications;
create trigger exhibition_applications_set_updated_at
  before update on public.exhibition_applications
  for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.exhibition_applications enable row level security;

-- Policies
drop policy if exists "Enable public insert for exhibition applications" on public.exhibition_applications;
create policy "Enable public insert for exhibition applications"
  on public.exhibition_applications
  for insert
  with check (true);

drop policy if exists "Enable public select for exhibition applications" on public.exhibition_applications;
create policy "Enable public select for exhibition applications"
  on public.exhibition_applications
  for select
  using (true);
