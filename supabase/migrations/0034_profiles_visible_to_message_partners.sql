-- ALSOUK — 0034: Let message partners see each other's basic profile.
--
-- profiles only had a "view own profile" SELECT policy, so resolving a
-- conversation partner's display name silently failed under RLS for anyone
-- who isn't a company owner (companies are public; bare user profiles were
-- not, even to people they were actively messaging).
--
-- Scoped narrowly: a profile is visible to another user only if the two of
-- them have exchanged at least one message — not opened up platform-wide.
--
-- Idempotent: safe to re-run.

drop policy if exists "Users can view message partners profiles" on public.profiles;
create policy "Users can view message partners profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.messages m
      where (m.sender_id = auth.uid() and m.receiver_id = profiles.id)
         or (m.receiver_id = auth.uid() and m.sender_id = profiles.id)
    )
  );
