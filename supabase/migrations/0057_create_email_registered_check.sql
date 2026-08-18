-- ALSOUK — 0057: server-side "is this signup email already taken" check.
--
-- Mitigation for the phone-signup account-squatting gap: the app derives a
-- synthetic email from a Tunisian phone number (phone{digits}@alsouk.com,
-- see lib/supabase/auth-helpers.ts) with no OTP verification of ownership.
-- Today the ONLY signal a caller gets that a number is already claimed is
-- Supabase's own signUp() error, discovered only after typing a full
-- registration form. This adds a cheap, safe pre-check the new
-- /api/auth/signup-guard route calls before that: a SECURITY DEFINER
-- function that answers "does this email exist in auth.users" without
-- exposing any other row data, so the guard route can return an honest,
-- specific message before the client ever calls signUp().
--
-- This does NOT fix account squatting itself (that still requires real SMS
-- OTP, a separate infra decision) — it only lets the app respond
-- immediately and rate-limits the check, instead of a bare unrate-limited
-- "User already registered" error.
--
-- Locked down the same way as check_rate_limit (0056): SECURITY DEFINER,
-- execute revoked from PUBLIC and re-granted to service_role only, so it
-- can't be called directly over PostgREST RPC by anon/authenticated.

create or replace function public.email_registered(p_email text)
returns boolean
language sql
security definer
stable
set search_path to 'public'
as $function$
  select exists (
    select 1 from auth.users where email = lower(p_email)
  );
$function$;

revoke all on function public.email_registered(text) from public;
grant execute on function public.email_registered(text) to service_role;
