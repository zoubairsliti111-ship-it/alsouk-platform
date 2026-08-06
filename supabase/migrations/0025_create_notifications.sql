-- ALSOUK — 0025: Incremental verification of notifications.
--
-- Note: Since `notifications` are already defined in baseline migration
-- 0007_create_notifications.sql, we do NOT recreate the table here.
-- Instead, we ensure all necessary performance indexes exist and RLS policies are updated correctly.
--
-- Idempotent: safe to re-run.

create index if not exists notifications_recipient_id_idx on public.notifications (recipient_id);
create index if not exists notifications_is_read_idx on public.notifications (is_read) where is_read = false;
create index if not exists notifications_type_idx on public.notifications (type);
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);

drop policy if exists "Recipients can view their own notifications" on public.notifications;
create policy "Recipients can view their own notifications"
  on public.notifications for select using (recipient_id = auth.uid());

drop policy if exists "Recipients can update their own notifications" on public.notifications;
create policy "Recipients can update their own notifications"
  on public.notifications for update using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

drop policy if exists "Recipients can delete their own notifications" on public.notifications;
create policy "Recipients can delete their own notifications"
  on public.notifications for delete using (recipient_id = auth.uid());

drop policy if exists "Anyone can insert notifications" on public.notifications;
create policy "Anyone can insert notifications"
  on public.notifications for insert with check (true);
