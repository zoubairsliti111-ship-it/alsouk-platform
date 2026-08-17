-- ALSOUK — 0058: M3-e — let additional company admins read messages
-- addressed to their company, not just the literal `companies.owner_id`.
--
-- public.messages has no company_id at all — sender_id/receiver_id are
-- individual auth.users ids, and the only SELECT policy today is
-- `auth.uid() = sender_id OR auth.uid() = receiver_id`. When a buyer
-- messages a company, receiver_id is that company's owner_id, so any
-- teammate added via company_members with role owner/admin (i.e. not the
-- literal owner_id) has zero visibility into their own company's inbox.
--
-- Scope, as agreed: RLS SELECT visibility only. This does NOT give the
-- unified-conversation-identity fix (a second admin's reply still lands
-- with their own sender_id, not a shared company identity) — that is a
-- separate, deeper data-model gap (no company_id on messages) tracked
-- separately (M3-c) and explicitly out of scope here.
--
-- Additive: this is a second permissive SELECT policy alongside the
-- existing "Users can view their messages" (Postgres ORs permissive
-- policies for the same command), so the original sender/receiver access
-- is untouched. Scoped with is_company_manager, the same helper already
-- used for rfqs (0053) and products/companies self-service.
--
-- Idempotent: safe to re-run.

drop policy if exists "Company managers can view their company's messages" on public.messages;
create policy "Company managers can view their company's messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.companies c
      where (c.owner_id = messages.sender_id or c.owner_id = messages.receiver_id)
        and is_company_manager(c.id)
    )
  );
