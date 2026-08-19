-- ALSOUK — 0061: Document RPCs/triggers created directly against the live
-- database, never captured in a migration.
--
-- Schema-drift audit (2026-08-19): five functions exist live with no
-- matching "create function" anywhere under supabase/migrations. All five
-- are confirmed live and in active use:
--
-- - increment_media_like / increment_media_view / increment_profile_view:
--   called directly via supabase.rpc(...) from
--   app/suppliers/[id]/feed/page.tsx and components/directory/supplier-profile.tsx.
-- - commercial_posts_bump_comment_count / commercial_posts_bump_like_count:
--   wired as AFTER INSERT/DELETE triggers on commercial_post_comments and
--   commercial_post_likes (trigger names commercial_post_comments_count /
--   commercial_post_likes_count) — the commercial-posts counterpart of
--   posts_bump_comment_count/posts_bump_like_count, which *are* documented
--   in 0015_social_commerce.sql.
--
-- Not recreated here — same reasoning as 0060: these already exist and
-- work, and a "create or replace function" here would just be restating
-- their current live definition, not fixing anything. This migration only
-- adds comments so a future reader doesn't have to reverse-engineer their
-- purpose/callers from the live DB.
--
-- Idempotent: safe to re-run.

comment on function public.increment_media_like(uuid) is
  'Predates the migrations folder (verified 2026-08-19). Called via '
  'supabase.rpc("increment_media_like", { media_id }) from '
  'app/suppliers/[id]/feed/page.tsx. security definer, increments '
  'company_media.like_count for the given media row.';

comment on function public.increment_media_view(uuid) is
  'Predates the migrations folder (verified 2026-08-19). Called via '
  'supabase.rpc("increment_media_view", { media_id }) from '
  'app/suppliers/[id]/feed/page.tsx. security definer, increments '
  'company_media.view_count for the given media row.';

comment on function public.increment_profile_view(uuid) is
  'Predates the migrations folder (verified 2026-08-19). Called via '
  'supabase.rpc("increment_profile_view", { target_company_id }) from '
  'app/suppliers/[id]/feed/page.tsx and components/directory/supplier-profile.tsx. '
  'security definer, increments companies.profile_views for the given company.';

comment on function public.commercial_posts_bump_comment_count() is
  'Predates the migrations folder (verified 2026-08-19). AFTER INSERT/DELETE '
  'trigger function (trigger: commercial_post_comments_count on '
  'commercial_post_comments) maintaining commercial_posts.comment_count — '
  'the commercial-posts counterpart of posts_bump_comment_count '
  '(documented in 0015_social_commerce.sql).';

comment on function public.commercial_posts_bump_like_count() is
  'Predates the migrations folder (verified 2026-08-19). AFTER INSERT/DELETE '
  'trigger function (trigger: commercial_post_likes_count on '
  'commercial_post_likes) maintaining commercial_posts.like_count — '
  'the commercial-posts counterpart of posts_bump_like_count '
  '(documented in 0015_social_commerce.sql).';
