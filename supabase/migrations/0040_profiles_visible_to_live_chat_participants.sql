-- ALSOUK — 0040: Let live-chat participants see each other's basic profile.
--
-- profiles only allowed SELECT for the owner (0000) or message partners
-- (0034), neither of which covers the live-chat scenario introduced by
-- live_session_messages (0039): two people chatting in the same live
-- session are strangers to each other under RLS, so resolveAuthor() in
-- use-live-chat.ts silently got null back for anyone but yourself and every
-- name rendered as the generic "Viewer" fallback.
--
-- Scoped narrowly, same shape as 0034: a profile is visible to another user
-- only if both of them have posted at least one message in the same
-- live_sessions session — not opened up platform-wide, and not granted
-- just for watching (there's no persisted attendee table; presence-based
-- viewer counts are ephemeral and never written to a row per viewer).
--
-- Idempotent: safe to re-run.

drop policy if exists "Users can view live chat participants profiles" on public.profiles;
create policy "Users can view live chat participants profiles"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.live_session_messages my_msg
      join public.live_session_messages their_msg
        on their_msg.session_id = my_msg.session_id
      where my_msg.sender_id = auth.uid()
        and their_msg.sender_id = profiles.id
    )
  );
