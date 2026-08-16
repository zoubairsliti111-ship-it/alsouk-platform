-- Closes the critical company_members takeover hole documented in
-- FULL_PROJECT_AUDIT.md §4 / §26 #1: the live INSERT policy
-- ("Creators can insert their own initial membership") only checked
-- `user_id = auth.uid()` with no company_id restriction at all, so any
-- authenticated caller could POST /rest/v1/company_members with an
-- arbitrary existing company_id and role:'owner' and immediately pass
-- is_company_manager() for a company they were never invited to —
-- full takeover (self-verify companies, wipe company_media/products,
-- evict the real owner from company_members).
--
-- Fix: self-insert is now only permitted when the row being inserted
-- verifiably matches the *real* companies.owner_id for that company_id
-- (the column companies' own INSERT policy already ties to
-- `owner_id = auth.uid()` at creation time — see 0002_create_marketplace.sql),
-- not merely "this user has no membership row yet". Role is pinned to
-- 'owner' since that's the only self-insert scenario this policy covers
-- (the initial creator linking themselves after creating the company row).
--
-- Team invitations (a second authorized way to add members — a
-- non-owner being invited by the real owner/admin) have NO existing
-- mechanism anywhere in this codebase: app/account/page.tsx literally
-- renders "Inviting additional team members isn't available yet" and
-- no invitations table, edge function, or service function exists.
-- That is a separate feature to be designed and built on its own; this
-- migration deliberately does not invent one. Until it exists, any
-- membership beyond the creator's own owner row can only be granted by
-- an existing owner/admin via the "Owners/admins can manage company
-- members" ALL policy (is_company_manager), which is unaffected by this
-- change.

drop policy if exists "Creators can insert their own initial membership" on public.company_members;

create policy "Real company owner can insert their own owner membership"
  on public.company_members for insert
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1 from public.companies c
      where c.id = company_members.company_id
        and c.owner_id = auth.uid()
    )
  );
