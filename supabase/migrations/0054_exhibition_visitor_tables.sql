-- ALSOUK — 0054: real tables for exhibition visitor favorites, private
-- notes, and meeting requests — replacing the in-memory MOCK_FAVORITES /
-- MOCK_NOTES / MOCK_MEETINGS arrays in lib/services/exhibitions-service.ts
-- (globalThis-cached, reset on every cold start/redeploy, never shared
-- across serverless instances — not real persistence at all despite
-- POST /api/exhibitions/visitor/{favorites,notes,meetings} returning
-- success:true).
--
-- Visitor identity: these pages never had any real identity mechanism —
-- `visitorId` was a hardcoded literal `"visitor-local"` shared by every
-- visitor on the platform, with no auth check anywhere. Rather than invent
-- a new identity system, this uses auth.uid() — the identity system this
-- app already uses for every other real per-user table (company_members,
-- saved_products, company_follows). The app-layer half of this (requiring
-- login, using the real session instead of the hardcoded string) is a
-- separate, non-DB change alongside this migration.
--
-- exhibition_booths/exhibition_items are both empty in production today
-- (0 rows), and the visitor-facing booth page also supports legacy
-- hardcoded demo ids ("booth-medina" etc, not real UUIDs) via
-- getMockBooths(). The FK constraints below are intentional: a demo booth
-- genuinely cannot be favorited/noted/booked for a real meeting until a
-- real exhibition_booths row exists — that's the honest behavior asked
-- for, not a bug. The app layer is responsible for surfacing that clearly
-- rather than letting a raw constraint violation reach the user.

-- ---------------------------------------------------------------------
-- exhibition_favorites — a visitor's saved booths/exhibits.
-- Polymorphic target (booth or exhibit) via two nullable FK columns
-- rather than a single untyped target_id: keeps referential integrity
-- instead of a free-floating id that could point at nothing.
-- ---------------------------------------------------------------------
create table if not exists public.exhibition_favorites (
  id          uuid primary key default gen_random_uuid(),
  visitor_id  uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('booth', 'exhibit')),
  booth_id    uuid references public.exhibition_booths(id) on delete cascade,
  exhibit_id  uuid references public.exhibition_items(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint exhibition_favorites_target_shape check (
    (target_type = 'booth' and booth_id is not null and exhibit_id is null) or
    (target_type = 'exhibit' and exhibit_id is not null and booth_id is null)
  )
);

-- Partial unique indexes, not a single UNIQUE(visitor_id, booth_id,
-- exhibit_id): Postgres never treats two NULLs as equal in a UNIQUE
-- constraint, so a plain unique constraint across both nullable columns
-- would silently allow duplicate favorites of the same target.
create unique index if not exists exhibition_favorites_booth_uniq
  on public.exhibition_favorites (visitor_id, booth_id) where target_type = 'booth';
create unique index if not exists exhibition_favorites_exhibit_uniq
  on public.exhibition_favorites (visitor_id, exhibit_id) where target_type = 'exhibit';
create index if not exists exhibition_favorites_visitor_idx
  on public.exhibition_favorites (visitor_id, created_at);

alter table public.exhibition_favorites enable row level security;

-- Explicit per-command policies, not `for all`: favorite rows are never
-- updated (only inserted or deleted), so a `for all` policy would imply
-- an UPDATE grant nothing ever uses — exactly the anon/authenticated
-- grant-vs-policy drift scripts/audit-rls-grants.sql exists to catch.
drop policy if exists "Visitors manage their own favorites" on public.exhibition_favorites;
drop policy if exists "Visitors view their own favorites" on public.exhibition_favorites;
drop policy if exists "Visitors add their own favorites" on public.exhibition_favorites;
drop policy if exists "Visitors remove their own favorites" on public.exhibition_favorites;

create policy "Visitors view their own favorites"
  on public.exhibition_favorites for select
  to authenticated
  using (auth.uid() = visitor_id);

create policy "Visitors add their own favorites"
  on public.exhibition_favorites for insert
  to authenticated
  with check (auth.uid() = visitor_id);

create policy "Visitors remove their own favorites"
  on public.exhibition_favorites for delete
  to authenticated
  using (auth.uid() = visitor_id);

grant select, insert, delete on public.exhibition_favorites to authenticated;

-- ---------------------------------------------------------------------
-- exhibition_visitor_notes — one private note per visitor per booth
-- (matches the existing save/deleteVisitorNote(visitorId, boothId)
-- upsert-style signatures in exhibitions-service.ts).
-- ---------------------------------------------------------------------
create table if not exists public.exhibition_visitor_notes (
  id         uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references auth.users(id) on delete cascade,
  booth_id   uuid not null references public.exhibition_booths(id) on delete cascade,
  note_text  text not null,
  tags       text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (visitor_id, booth_id)
);

create index if not exists exhibition_visitor_notes_visitor_idx
  on public.exhibition_visitor_notes (visitor_id);

alter table public.exhibition_visitor_notes enable row level security;

drop policy if exists "Visitors manage their own notes" on public.exhibition_visitor_notes;
create policy "Visitors manage their own notes"
  on public.exhibition_visitor_notes for all
  to authenticated
  using (auth.uid() = visitor_id)
  with check (auth.uid() = visitor_id);

grant select, insert, update, delete on public.exhibition_visitor_notes to authenticated;

-- ---------------------------------------------------------------------
-- exhibition_meetings — a visitor's meeting request with an exhibitor.
-- Only visitor-side RLS for now (a visitor manages their own requests);
-- exhibitor/company-side visibility into requests addressed to their
-- booth is a separate, not-yet-built feature — out of scope here.
-- ---------------------------------------------------------------------
create table if not exists public.exhibition_meetings (
  id                 uuid primary key default gen_random_uuid(),
  visitor_id         uuid not null references auth.users(id) on delete cascade,
  booth_id           uuid not null references public.exhibition_booths(id) on delete cascade,
  company_id         uuid not null references public.companies(id) on delete cascade,
  preferred_date     text not null,
  preferred_time     text not null,
  purpose            text not null,
  expected_volume    text not null,
  preferred_language text not null,
  notes              text,
  status             text not null default 'Pending'
                        check (status in ('Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists exhibition_meetings_visitor_idx
  on public.exhibition_meetings (visitor_id, created_at);

alter table public.exhibition_meetings enable row level security;

drop policy if exists "Visitors manage their own meeting requests" on public.exhibition_meetings;
create policy "Visitors manage their own meeting requests"
  on public.exhibition_meetings for all
  to authenticated
  using (auth.uid() = visitor_id)
  with check (auth.uid() = visitor_id);

grant select, insert, update, delete on public.exhibition_meetings to authenticated;
