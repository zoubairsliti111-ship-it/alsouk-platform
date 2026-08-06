-- ALSOUK — 0026: Incremental verification of exhibitions platform.
--
-- Note: Since `exhibitions`, `exhibition_booths`, `exhibition_items`, `exhibition_media`,
-- `exhibition_documents`, and `exhibition_applications` are already defined in baseline
-- migrations 0008, 0009, 0010, 0011, 0012, and 0013, we do NOT recreate those tables.
-- Instead, we verify indexes, ensure all RLS policies work securely, and configure triggers cleanly.
--
-- Idempotent: safe to re-run.

create index if not exists exhibitions_slug_idx on public.exhibitions (slug);
create index if not exists exhibitions_dates_idx on public.exhibitions (start_date, end_date);
create index if not exists exhibition_booths_exhibition_idx on public.exhibition_booths (exhibition_id);
create index if not exists exhibition_booths_company_idx on public.exhibition_booths (company_id);
create index if not exists exhibition_items_booth_idx on public.exhibition_items (booth_id);
create index if not exists exhibition_media_booth_idx on public.exhibition_media (booth_id);
create index if not exists exhibition_documents_booth_idx on public.exhibition_documents (booth_id);
create index if not exists exhibition_applications_exhibition_idx on public.exhibition_applications (exhibition_id);
create index if not exists exhibition_applications_company_idx on public.exhibition_applications (company_id);
create index if not exists exhibition_applications_status_idx on public.exhibition_applications (status);
create index if not exists exhibition_applications_created_idx on public.exhibition_applications (created_at);

-- Triggers (idempotent creation)
drop trigger if exists exhibitions_set_updated_at on public.exhibitions;
create trigger exhibitions_set_updated_at
  before update on public.exhibitions
  for each row execute function public.set_updated_at();

drop trigger if exists exhibition_booths_set_updated_at on public.exhibition_booths;
create trigger exhibition_booths_set_updated_at
  before update on public.exhibition_booths
  for each row execute function public.set_updated_at();

drop trigger if exists exhibition_items_set_updated_at on public.exhibition_items;
create trigger exhibition_items_set_updated_at
  before update on public.exhibition_items
  for each row execute function public.set_updated_at();

drop trigger if exists exhibition_applications_set_updated_at on public.exhibition_applications;
create trigger exhibition_applications_set_updated_at
  before update on public.exhibition_applications
  for each row execute function public.set_updated_at();

-- RLS: exhibitions platforms (all have RLS enabled today, ensuring policies exist)
alter table public.exhibitions enable row level security;
drop policy if exists "Exhibitions are publicly readable" on public.exhibitions;
create policy "Exhibitions are publicly readable" on public.exhibitions for select using (true);

alter table public.exhibition_booths enable row level security;
drop policy if exists "Exhibition booths are publicly readable" on public.exhibition_booths;
create policy "Exhibition booths are publicly readable" on public.exhibition_booths for select using (true);

alter table public.exhibition_items enable row level security;
drop policy if exists "Exhibition items are publicly readable" on public.exhibition_items;
create policy "Exhibition items are publicly readable" on public.exhibition_items for select using (true);

alter table public.exhibition_media enable row level security;
drop policy if exists "Exhibition media are publicly readable" on public.exhibition_media;
create policy "Exhibition media are publicly readable" on public.exhibition_media for select using (true);

alter table public.exhibition_documents enable row level security;
drop policy if exists "Exhibition documents are publicly readable" on public.exhibition_documents;
create policy "Exhibition documents are publicly readable" on public.exhibition_documents for select using (true);

alter table public.exhibition_applications enable row level security;
drop policy if exists "Enable public insert for exhibition applications" on public.exhibition_applications;
create policy "Enable public insert for exhibition applications" on public.exhibition_applications for insert with check (true);
drop policy if exists "Enable public select for exhibition applications" on public.exhibition_applications;
create policy "Enable public select for exhibition applications" on public.exhibition_applications for select using (true);
