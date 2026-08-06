-- ALSOUK — 0021: Add `slug`, `name`, `parent_id`, `position`, `description`
-- to the EXISTING public.categories table (which today only has
-- name_ar/name_fr/name_en). Additive only — trilingual columns are kept
-- untouched for any code path still reading them.
--
-- ⚠️ OPEN DECISION FLAGGED PREVIOUSLY, RESOLVED HERE WITH A CONSERVATIVE
-- DEFAULT (please review before running on production):
--   * `name` is backfilled from `name_ar` (assumption: Arabic as the primary
--     market language). Change the backfill source below if a different
--     language should be authoritative.
--   * `slug` CANNOT be safely auto-generated from Arabic text without the
--     `unaccent` extension (not installed on this project) or a proper
--     transliteration table — guessing one risks unreadable or colliding
--     slugs. Since there are only 6 existing category rows, this migration
--     assigns a SAFE, UNIQUE, but NOT human-friendly placeholder
--     ('category-' + first 8 chars of the row id) so the NOT NULL/UNIQUE
--     constraints the app expects can be satisfied immediately without
--     blocking anything. These 6 placeholder slugs should be reviewed and
--     replaced with real, readable slugs manually (a simple UPDATE per row,
--     not a migration) once the correct human-readable values are decided.
--
-- Idempotent: safe to re-run (backfills only fill NULLs, never overwrite).

alter table public.categories add column if not exists slug text;
alter table public.categories add column if not exists name text;
alter table public.categories add column if not exists parent_id uuid references public.categories (id) on delete set null;
alter table public.categories add column if not exists description text;
alter table public.categories add column if not exists position integer not null default 0;
alter table public.categories add column if not exists updated_at timestamptz not null default now();

-- Backfill `name` from the assumed primary language.
update public.categories
set name = name_ar
where name is null and name_ar is not null;

-- Backfill `slug` with a safe, collision-free placeholder for existing rows
-- only (new rows created by the app going forward are expected to supply a
-- real slug themselves).
update public.categories
set slug = 'category-' || left(id::text, 8)
where slug is null;

-- Enforce the uniqueness the app relies on, now that every row has a value.
create unique index if not exists categories_slug_key on public.categories (slug);
create index if not exists categories_parent_id_idx on public.categories (parent_id);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- RLS: public read (categories has RLS enabled today with zero policies,
-- i.e. fully blocked — this adds the missing read policy without touching
-- anything else).
alter table public.categories enable row level security;

drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable"
  on public.categories for select using (true);
