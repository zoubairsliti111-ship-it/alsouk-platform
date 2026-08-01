-- ALSOUK — Create Exhibition Administrative Review Policies
--
-- Enables safe public UPDATE access to applications and INSERT/UPDATE access to booths
-- so that organizer reviews and automatic draft booth provisioning work flawlessly.
--
-- Idempotent: safe to re-run.

-- 1. Policies for exhibition_applications
drop policy if exists "Enable public update for exhibition applications" on public.exhibition_applications;
create policy "Enable public update for exhibition applications"
  on public.exhibition_applications
  for update
  using (true)
  with check (true);

-- 2. Policies for exhibition_booths
drop policy if exists "Enable public insert for exhibition booths" on public.exhibition_booths;
create policy "Enable public insert for exhibition booths"
  on public.exhibition_booths
  for insert
  with check (true);

drop policy if exists "Enable public update for exhibition booths" on public.exhibition_booths;
create policy "Enable public update for exhibition booths"
  on public.exhibition_booths
  for update
  using (true)
  with check (true);
