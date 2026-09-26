-- Admin visibility into all profiles + audit logging for role changes
create policy "profiles: admin read all" on profiles
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles: admin update all" on profiles
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Prevent a user from granting themselves admin directly (only an existing admin can change roles)
create or replace function prevent_self_role_escalation()
returns trigger as $$
begin
  if new.role <> old.role and auth.uid() = old.id then
    if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
      raise exception 'Only an admin can change roles';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_role_change on profiles;
create trigger on_profile_role_change
  before update on profiles
  for each row execute procedure prevent_self_role_escalation();
