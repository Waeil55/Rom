-- The admin policies on `profiles` queried `profiles` from within their own USING clause,
-- which re-triggers RLS recursively and causes "infinite recursion detected in policy" (Postgres 500s).
-- Fix: check admin status through a SECURITY DEFINER function that runs as the table owner
-- (bypassing RLS for that internal lookup only), so the policy itself no longer recurses.

drop policy if exists "profiles: admin read all" on profiles;
drop policy if exists "profiles: admin update all" on profiles;

create or replace function is_admin(uid uuid)
returns boolean as $$
  select exists (select 1 from profiles where id = uid and role = 'admin');
$$ language sql stable security definer set search_path = public;

create policy "profiles: admin read all" on profiles
  for select using (is_admin(auth.uid()));

create policy "profiles: admin update all" on profiles
  for update using (is_admin(auth.uid()));

-- Same recursion risk existed in the role-escalation guard trigger; rewrite it with the function too.
create or replace function prevent_self_role_escalation()
returns trigger as $$
begin
  if new.role <> old.role and auth.uid() = old.id then
    if not is_admin(auth.uid()) then
      raise exception 'Only an admin can change roles';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;
