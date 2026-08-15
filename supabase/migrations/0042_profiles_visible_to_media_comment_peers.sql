-- ALSOUK — 0042: Let media-comment peers see each other's basic profile.
--
-- Same root cause as 0040, wider surface: company_media and
-- company_media_comments are both unconditionally public (`using (true)`
-- SELECT policies, no private-media concept exists in this schema), so
-- commenting on a company's media is a public act. But profiles SELECT
-- still only covered owner (0000) / message partners (0034) / live chat
-- co-participants (0040) — anyone commenting on the same public media as
-- you, without also being a message partner or live-chat co-participant,
-- resolved to null and rendered as "Viewer" in the feed and Studio comment
-- lists (app/suppliers/[id]/feed/page.tsx, app/studio/page.tsx,
-- components/studio/studio-panel.tsx).
--
-- Scoped the same way as 0040: reciprocal, not one-directional. A profile
-- is visible to another user only if both of them have left at least one
-- comment on the same media_id — not "commented on anything," and not
-- "the media's company can see all its commenters" (that's a separate,
-- unrequested case: a company owner who has never personally commented on
-- their own media still won't resolve commenter names through this policy
-- alone).
--
-- Idempotent: safe to re-run.

drop policy if exists "Users can view media comment peers profiles" on public.profiles;
create policy "Users can view media comment peers profiles"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.company_media_comments my_comment
      join public.company_media_comments their_comment
        on their_comment.media_id = my_comment.media_id
      where my_comment.user_id = auth.uid()
        and their_comment.user_id = profiles.id
    )
  );
