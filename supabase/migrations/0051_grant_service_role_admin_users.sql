-- admin_users (0050) was created with RLS enabled and zero policies,
-- correctly blocking anon/authenticated. But service_role's RLS bypass
-- (BYPASSRLS) is a separate Postgres privilege layer from the standard
-- table-level GRANT, which was never issued — so service_role itself got
-- 42501 "permission denied for table admin_users" on every lookup,
-- silently denying every real admin. Same class of bug
-- scripts/audit-rls-grants.sql checks for anon/authenticated, but not for
-- service_role.
grant select on admin_users to service_role;
