-- ALSOUK — 0025: Notifications system (brand new table, no legacy
-- conflict). Re-implements the intent of historical 0007 (never applied)
-- as a new, independent file. Fully self-contained — only references
-- auth.users(id) and companies(id), both of which already exist.
--
-- CONFIRMED NEED: production API logs show repeated 404s from real user
-- traffic hitting `/rest/v1/notifications` before this table existed.
--
-- Idempotent: safe to re-run.

create table if not exists public.notifications (
  id               uuid        primary key default gen_random_uuid(),
  recipient_id     uuid        not null references auth.users (id) on delete cascade,
  actor_company_id uuid        references public.companies (id) on delete set null,
  type             text        not null,
  entity_type      text,
  entity_id        text,
  title            text        not null,
  body             text        not null,
  image_url        text,
  action_url       text,
  is_read          boolean     not null default false,
  created_at       timestamptz not null default now(),
  metadata         jsonb       not null default '{}'::jsonb
);

create index if not exists notifications_recipient_id_idx on public.notifications (recipient_id);
create index if not exists notifications_is_read_idx on public.notifications (is_read) where is_read = false;
create index if not exists notifications_type_idx on public.notifications (type);
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);

alter table public.notifications enable row level security;

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
