-- ALSOUK — 0060: Document that profiles/messages/company_media_comments
-- predate the migrations folder.
--
-- Schema-drift audit (2026-08-19): none of the three base `create table`
-- statements for public.profiles, public.messages, or
-- public.company_media_comments exist anywhere under supabase/migrations —
-- nor do their original RLS policies ("Users can view own profile",
-- "Users can send messages", "Comments are publicly readable", etc). Only
-- later incremental changes layered on top were ever committed (0033, 0034,
-- 0040, 0042, 0043, 0045...). These three tables were created directly
-- against the live database before this migrations discipline started, so
-- a fresh environment built from `supabase/migrations` alone would be
-- missing them entirely.
--
-- Not recreated here — these tables already exist and work correctly, and
-- this project's convention is no edits to existing schema without a
-- strong reason (see migration 0049). This migration only adds comments so
-- a future reader (or a "rebuild staging from migrations" attempt) knows
-- the gap exists instead of discovering it by surprise.
--
-- Idempotent: safe to re-run.

comment on table public.profiles is
  'Predates the migrations folder — no CREATE TABLE for this table exists '
  'under supabase/migrations (verified 2026-08-19). Only later additive '
  'changes (0033 backfill/auto-create trigger, 0040/0042/0034 cross-visibility '
  'policies, 0045 visibility flags) were ever committed. A fresh environment '
  'built from migrations alone will not have this table.';

comment on policy "Users can view own profile" on public.profiles is
  'Original policy, predates the migrations folder (verified 2026-08-19). USING (auth.uid() = id).';

comment on policy "Users can update own profile" on public.profiles is
  'Original policy, predates the migrations folder (verified 2026-08-19). USING (auth.uid() = id).';

comment on policy "Users can insert own profile" on public.profiles is
  'Original policy, predates the migrations folder (verified 2026-08-19). WITH CHECK (auth.uid() = id).';

comment on table public.messages is
  'Predates the migrations folder — no CREATE TABLE for this table exists '
  'under supabase/migrations (verified 2026-08-19). Only later additive '
  'policy changes (0058 messages_visible_to_company_managers) were ever '
  'committed. A fresh environment built from migrations alone will not '
  'have this table.';

comment on policy "Users can view their messages" on public.messages is
  'Original policy, predates the migrations folder (verified 2026-08-19). USING (auth.uid() = sender_id OR auth.uid() = receiver_id).';

comment on policy "Users can send messages" on public.messages is
  'Original policy, predates the migrations folder (verified 2026-08-19). WITH CHECK (auth.uid() = sender_id).';

comment on policy "Users can update received messages" on public.messages is
  'Original policy, predates the migrations folder (verified 2026-08-19). USING (auth.uid() = receiver_id).';

comment on table public.company_media_comments is
  'Predates the migrations folder — no CREATE TABLE for this table exists '
  'under supabase/migrations (verified 2026-08-19). Only later additive '
  'changes (0042 profiles-visibility policy, 0043 privilege grants) were '
  'ever committed. A fresh environment built from migrations alone will '
  'not have this table.';

comment on policy "Comments are publicly readable" on public.company_media_comments is
  'Original policy, predates the migrations folder (verified 2026-08-19). USING (true).';

comment on policy "Authenticated users can comment" on public.company_media_comments is
  'Original policy, predates the migrations folder (verified 2026-08-19). WITH CHECK (auth.uid() = user_id).';

comment on policy "Users can delete their own comments" on public.company_media_comments is
  'Original policy, predates the migrations folder (verified 2026-08-19). USING (auth.uid() = user_id).';
