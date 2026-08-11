-- ALSOUK — 0036: Grant service_role full table privileges across the schema.
--
-- Root cause of persistent 403s from every service-role-backed admin route
-- (found while debugging /admin/companies): 29 public tables — including
-- companies, rfqs, stores, notifications, exhibitions and more — had never
-- been granted SELECT/INSERT/UPDATE/DELETE for the `service_role` role,
-- even though `anon` and `authenticated` had full grants (safe only because
-- RLS restricts them). service_role is meant to bypass RLS entirely for
-- server-side/admin operations, but without the base table-level GRANT it
-- was rejected by PostgREST with 403 regardless of which valid API key was
-- used. This is very likely the real, previously-undocumented content of
-- migration 0031 ("critical_grant_missing_table_privileges"), which could
-- not be reconstructed from schema state alone at the time it was tracked.
--
-- Idempotent: safe to re-run (GRANT is a no-op if already granted).

grant select, insert, update, delete on public.commercial_post_bookmarks to service_role;
grant select, insert, update, delete on public.commercial_post_comments to service_role;
grant select, insert, update, delete on public.commercial_post_likes to service_role;
grant select, insert, update, delete on public.commercial_post_media to service_role;
grant select, insert, update, delete on public.commercial_post_views to service_role;
grant select, insert, update, delete on public.commercial_posts to service_role;
grant select, insert, update, delete on public.companies to service_role;
grant select, insert, update, delete on public.company_categories to service_role;
grant select, insert, update, delete on public.company_follows to service_role;
grant select, insert, update, delete on public.company_media to service_role;
grant select, insert, update, delete on public.company_media_comments to service_role;
grant select, insert, update, delete on public.company_members to service_role;
grant select, insert, update, delete on public.company_store_integrations to service_role;
grant select, insert, update, delete on public.exhibition_applications to service_role;
grant select, insert, update, delete on public.exhibition_booths to service_role;
grant select, insert, update, delete on public.exhibition_documents to service_role;
grant select, insert, update, delete on public.exhibition_items to service_role;
grant select, insert, update, delete on public.exhibition_media to service_role;
grant select, insert, update, delete on public.exhibitions to service_role;
grant select, insert, update, delete on public.live_sessions to service_role;
grant select, insert, update, delete on public.notifications to service_role;
grant select, insert, update, delete on public.post_comments to service_role;
grant select, insert, update, delete on public.post_likes to service_role;
grant select, insert, update, delete on public.post_media to service_role;
grant select, insert, update, delete on public.posts to service_role;
grant select, insert, update, delete on public.product_categories to service_role;
grant select, insert, update, delete on public.product_images to service_role;
grant select, insert, update, delete on public.rfqs to service_role;
grant select, insert, update, delete on public.stores to service_role;
