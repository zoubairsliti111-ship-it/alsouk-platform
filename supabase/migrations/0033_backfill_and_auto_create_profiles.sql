-- ALSOUK — 0033: Auto-create a profiles row for every user, and backfill
-- existing users.
--
-- messages.sender_id / messages.receiver_id reference profiles(id), but
-- nothing ever populated profiles automatically on signup — every insert
-- into messages was failing with a foreign key violation because the
-- authenticated user had no matching profiles row.
--
-- Idempotent: safe to re-run.

-- Backfill: create a profiles row for every existing auth user that doesn't
-- have one yet.
insert into public.profiles (id, full_name)
select u.id, u.raw_user_meta_data->>'full_name'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- Going forward: auto-create a profiles row whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
