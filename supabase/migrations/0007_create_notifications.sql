-- ALSOUK — Notifications System Migration.
-- Adds the `public.notifications` table, sets up indices, and Row-Level Security (RLS) policies.
--
-- Idempotent: safe to re-run.

-- 1. Create table public.notifications
create table if not exists public.notifications (
  id                uuid        primary key default gen_random_uuid(),
  recipient_id      uuid        not null references auth.users (id) on delete cascade,
  actor_company_id  uuid        references public.companies (id) on delete set null,
  type              text        not null,
  entity_type       text,
  entity_id         text,
  title             text        not null,
  body              text        not null,
  image_url         text,
  action_url        text,
  is_read           boolean     not null default false,
  created_at        timestamptz not null default now(),
  metadata          jsonb       not null default '{}'::jsonb
);

-- 2. Indexes for performance
create index if not exists notifications_recipient_id_idx on public.notifications (recipient_id);
create index if not exists notifications_is_read_idx on public.notifications (is_read) where is_read = false;
create index if not exists notifications_type_idx on public.notifications (type);
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);

-- 3. Enable Row Level Security (RLS)
alter table public.notifications enable row level security;

-- Drop existing policies defensively
drop policy if exists "Recipients can view their own notifications" on public.notifications;
drop policy if exists "Recipients can update their own notifications" on public.notifications;
drop policy if exists "Recipients can delete their own notifications" on public.notifications;
drop policy if exists "Anyone can insert notifications" on public.notifications;

-- 4. Policies
-- Select: Only recipient can view their notifications
create policy "Recipients can view their own notifications"
  on public.notifications
  for select
  using (recipient_id = auth.uid());

-- Update: Only recipient can update their notifications (e.g. is_read status)
create policy "Recipients can update their own notifications"
  on public.notifications
  for update
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- Delete: Only recipient can delete their notifications
create policy "Recipients can delete their own notifications"
  on public.notifications
  for delete
  using (recipient_id = auth.uid());

-- Insert: Anyone can insert notifications to support system actions or actor-driven triggers
create policy "Anyone can insert notifications"
  on public.notifications
  for insert
  with check (true);
