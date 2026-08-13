-- ALSOUK — 0037: Real live video streaming (Agora) support for live_sessions.
--
-- live_sessions already exists (0015_social_commerce.sql, verified in
-- 0027_create_social_commerce_layer.sql) with company_id, title, status
-- (upcoming/live/ended), started_at, ended_at, viewer_count. This migration
-- only adds the Agora channel binding — no table is recreated, no existing
-- column is altered or dropped. Idempotent: safe to re-run.

alter table public.live_sessions add column if not exists agora_channel_name text;

-- One active Agora channel per session; NULL is allowed for legacy/upcoming
-- rows that haven't gone live yet, so the uniqueness only applies once set.
create unique index if not exists live_sessions_agora_channel_name_idx
  on public.live_sessions (agora_channel_name)
  where agora_channel_name is not null;
