-- ALSOUK — 0043: Grant missing table privileges on company_media_comments.
--
-- Found while verifying 0042: anon/authenticated had zero GRANTs on this
-- table (only REFERENCES/TRIGGER/TRUNCATE — the implicit defaults, not
-- SELECT/INSERT/DELETE), so every one of its three RLS policies ("Comments
-- are publicly readable", "Authenticated users can comment", "Users can
-- delete their own comments") was dead code: PostgREST rejects the query
-- with 42501 permission denied before RLS is ever evaluated. The comment
-- feature (feed/page.tsx, Studio) has been silently non-functional for
-- reads, posts, and deletes via the public API the whole time — same root
-- cause as 0031/0036/0039 (see 0039's comment: "this project has twice
-- shipped tables whose anon/authenticated grants silently didn't match the
-- default ACL"). Third time.
--
-- Grants match exactly the three existing policies: select for everyone,
-- insert/delete for authenticated only (both already row-scoped by RLS —
-- insert is open, delete requires auth.uid() = user_id).
--
-- Idempotent: safe to re-run.

grant select on public.company_media_comments to anon, authenticated;
grant insert, delete on public.company_media_comments to authenticated;
