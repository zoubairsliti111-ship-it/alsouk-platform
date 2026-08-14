-- ALSOUK — 0039: Live chat messages for broadcast sessions.
--
-- Simple, chronological chat only — no moderation, no reactions, no
-- threading. Publicly readable (same as live_sessions itself), insert
-- restricted to authenticated users posting as themselves. Rate-limited
-- per sender per session via trigger, same pattern as rfqs_rate_limit_check
-- (0032): more than 10 messages from the same sender in the same session
-- within 30 seconds is rejected.

create table if not exists public.live_session_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  sender_id  uuid not null references auth.users(id) on delete cascade,
  message    text not null check (char_length(message) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists live_session_messages_session_id_idx
  on public.live_session_messages (session_id, created_at);

alter table public.live_session_messages enable row level security;

drop policy if exists "Live chat publicly readable" on public.live_session_messages;
create policy "Live chat publicly readable"
  on public.live_session_messages for select using (true);

drop policy if exists "Authenticated users send live chat" on public.live_session_messages;
create policy "Authenticated users send live chat"
  on public.live_session_messages for insert to authenticated
  with check (auth.uid() = sender_id);

create or replace function public.live_chat_rate_limit()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.live_session_messages
  where sender_id = new.sender_id
    and session_id = new.session_id
    and created_at > now() - interval '30 seconds';

  if recent_count >= 10 then
    raise exception 'Too many messages sent recently. Please slow down.'
      using errcode = '23514';
  end if;

  return new;
end;
$function$;

drop trigger if exists live_chat_rate_limit_check on public.live_session_messages;
create trigger live_chat_rate_limit_check
  before insert on public.live_session_messages
  for each row execute function public.live_chat_rate_limit();

-- Defensive: this project has twice shipped tables whose anon/authenticated
-- grants silently didn't match the default ACL (0031, 0036). Grant
-- explicitly rather than relying on the schema default.
grant select, insert on public.live_session_messages to anon, authenticated;
grant select, insert, update, delete on public.live_session_messages to service_role;

-- Required for supabase-js postgres_changes subscriptions to fire at all —
-- the supabase_realtime publication has no tables in it on this project by
-- default, so without this the chat UI would silently receive nothing.
alter publication supabase_realtime add table public.live_session_messages;
