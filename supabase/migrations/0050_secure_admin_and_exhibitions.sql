-- Secures /admin and the Exhibitions module.
--
-- Two independent problems, same root cause (no auth check at either the API
-- or the RLS layer):
--
-- 1. There was no concept of "admin" anywhere in the schema — only a shared
--    RFQ_ADMIN_TOKEN env var gating two pages. `admin_users` is a minimal,
--    fully-locked identity table: RLS is enabled with zero policies, so it
--    is unreadable/unwritable by anon *and* authenticated — the only way to
--    query it is the service-role key from trusted server code. This is the
--    same "service-role only, by design" shape already used for
--    company_store_integrations' access_token column.
--
-- 2. exhibition_applications/exhibition_booths had `qual=true` INSERT/UPDATE
--    policies (anyone with the public anon key could approve/reject
--    applications or rewrite any booth), and exhibitions/exhibition_items/
--    exhibition_media/exhibition_documents had no write policies at all
--    (writes silently failed for everyone, including legitimate owners).
--    This migration locks the former down to service-role-only writes
--    (performed by the newly-gated admin API routes) and opens the latter
--    to real owners only, via the existing is_company_manager() helper —
--    the same rule already used by products/stores/company_media.

-- ---------------------------------------------------------------------------
-- 1. admin_users — minimal, fully-locked admin identity table.
-- ---------------------------------------------------------------------------
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;
-- Intentionally zero policies for anon/authenticated: this table is read
-- exclusively via the service-role key from lib/admin/server.ts.

-- ---------------------------------------------------------------------------
-- 2. exhibitions — add the columns the app has been writing to/reading from
--    since exhibitions-service.ts and the /admin/exhibitions forms were
--    built, but that were never migrated onto the real table.
-- ---------------------------------------------------------------------------
alter table exhibitions
  add column if not exists logo_url text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists website text;

-- ---------------------------------------------------------------------------
-- 3. exhibition_applications — close the public read (applicant PII: email,
--    phone) and public write (approve/reject by anyone). Public INSERT stays
--    — the "apply to exhibit" form is intentionally open to anyone.
-- ---------------------------------------------------------------------------
drop policy if exists "Enable public select for exhibition applications" on exhibition_applications;
drop policy if exists "Enable public update for exhibition applications" on exhibition_applications;

-- ---------------------------------------------------------------------------
-- 4. exhibition_booths — booths stay publicly readable (booth pages are
--    public). INSERT closes entirely: booths are only ever created by
--    approveApplication() via the service-role key. UPDATE narrows from
--    "anyone" to "the company that owns this booth", matching products/
--    stores/company_media.
-- ---------------------------------------------------------------------------
drop policy if exists "Enable public insert for exhibition booths" on exhibition_booths;
drop policy if exists "Enable public update for exhibition booths" on exhibition_booths;

create policy "Booth owners can update their own booth"
  on exhibition_booths for update
  using (is_company_manager(company_id))
  with check (is_company_manager(company_id));

-- ---------------------------------------------------------------------------
-- 5. exhibition_items / exhibition_media / exhibition_documents — these had
--    SELECT-only policies, meaning every write (create/update/delete an
--    exhibit, upload media, upload a document) was already failing closed
--    for everyone, including the booth's real owner. Adds ownership-scoped
--    write policies (same is_company_manager rule, resolved through the
--    parent booth's company_id) so the feature actually works for owners,
--    without opening it to the public.
-- ---------------------------------------------------------------------------
create policy "Booth owners can manage their exhibits"
  on exhibition_items for all
  using (is_company_manager((select eb.company_id from exhibition_booths eb where eb.id = exhibition_items.booth_id)))
  with check (is_company_manager((select eb.company_id from exhibition_booths eb where eb.id = exhibition_items.booth_id)));

create policy "Booth owners can manage their media"
  on exhibition_media for all
  using (is_company_manager((select eb.company_id from exhibition_booths eb where eb.id = exhibition_media.booth_id)))
  with check (is_company_manager((select eb.company_id from exhibition_booths eb where eb.id = exhibition_media.booth_id)));

create policy "Booth owners can manage their documents"
  on exhibition_documents for all
  using (is_company_manager((select eb.company_id from exhibition_booths eb where eb.id = exhibition_documents.booth_id)))
  with check (is_company_manager((select eb.company_id from exhibition_booths eb where eb.id = exhibition_documents.booth_id)));
