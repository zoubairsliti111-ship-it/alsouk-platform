-- ALSOUK — 0032: Rate-limit RFQ submissions per email.
--
-- Reconstructed from the live production function/trigger definition (this
-- migration was applied directly to Supabase before it was ever committed
-- to the repo — see the CURRENT_STATE_AUDIT.md finding on migration/schema
-- drift). Blocks a burst of RFQ submissions from the same email address:
-- more than 3 within a 10 minute window is rejected.
--
-- Idempotent: safe to re-run.

create or replace function public.rfqs_rate_limit()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.rfqs
  where email = new.email
    and created_at > now() - interval '10 minutes';

  if recent_count >= 3 then
    raise exception 'Too many RFQ submissions from this email recently. Please wait a few minutes before submitting again.'
      using errcode = '23514';
  end if;

  return new;
end;
$function$;

drop trigger if exists rfqs_rate_limit_check on public.rfqs;
create trigger rfqs_rate_limit_check
  before insert on public.rfqs
  for each row execute function public.rfqs_rate_limit();
