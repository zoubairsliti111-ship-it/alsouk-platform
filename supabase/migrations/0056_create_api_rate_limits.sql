-- ALSOUK — 0056: Rate limiting for /api/ai and /api/search.
--
-- Both routes are public (no auth required) and /api/ai calls out to Groq (a
-- shared, quota-limited key) with no request cap today — an anonymous
-- script could exhaust the AI quota for every real user. This adds a small,
-- generic per-key/per-endpoint counter table plus a SECURITY DEFINER
-- function the route handlers call before doing real work, mirroring the
-- trigger-based rate limiting already used for rfqs (0032) and live chat
-- (0039) — just callable directly, since neither route inserts into a table
-- of its own to hang a trigger off of.
--
-- Locked down like admin_users (0050): RLS enabled, zero policies, so only
-- service_role (via the function) can touch it. Per the pattern that has
-- bitten this project repeatedly (0031, 0036, 0039, 0043, 0051, 0055),
-- service_role's RLS bypass does NOT imply table-level grants — granted
-- explicitly below rather than assumed.
--
-- Idempotent: safe to re-run.

create table if not exists public.api_rate_limits (
  id         bigint generated always as identity primary key,
  bucket_key text not null,
  endpoint   text not null,
  created_at timestamptz not null default now()
);

create index if not exists api_rate_limits_lookup_idx
  on public.api_rate_limits (bucket_key, endpoint, created_at);

alter table public.api_rate_limits enable row level security;
-- No policies: locked to service_role only (via the function below), same
-- shape as admin_users.

grant select, insert, delete on public.api_rate_limits to service_role;

/**
 * Atomically checks and records a rate-limit hit for (p_key, p_endpoint).
 * Prunes entries older than the window for that key/endpoint first, so the
 * table self-trims without a separate cron job. Returns true when the call
 * is allowed (and is recorded), false when the caller is already over the
 * limit for this window.
 */
create or replace function public.check_rate_limit(
  p_key text,
  p_endpoint text,
  p_max_requests integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  recent_count integer;
begin
  delete from public.api_rate_limits
  where bucket_key = p_key
    and endpoint = p_endpoint
    and created_at <= now() - make_interval(secs => p_window_seconds);

  select count(*) into recent_count
  from public.api_rate_limits
  where bucket_key = p_key
    and endpoint = p_endpoint;

  if recent_count >= p_max_requests then
    return false;
  end if;

  insert into public.api_rate_limits (bucket_key, endpoint) values (p_key, p_endpoint);
  return true;
end;
$function$;

-- Functions default to PUBLIC execute — revoke and grant explicitly so
-- anon/authenticated can't call this directly over PostgREST RPC and poison
-- another caller's bucket (same "grant explicitly, never assume" discipline
-- documented above for the table).
revoke all on function public.check_rate_limit(text, text, integer, integer) from public;
grant execute on function public.check_rate_limit(text, text, integer, integer) to service_role;
