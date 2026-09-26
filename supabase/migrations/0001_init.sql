-- PharmaLearn core schema
create type user_role as enum ('student', 'admin');

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null default '',
  role user_role not null default 'student',
  daily_goal_minutes int not null default 20,
  created_at timestamptz not null default now()
);

create table if not exists bookmarks (
  user_id uuid references profiles (id) on delete cascade,
  medicine_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, medicine_id)
);

create table if not exists study_progress (
  user_id uuid references profiles (id) on delete cascade,
  medicine_id text not null,
  section text not null,
  mastery_score numeric not null default 0,
  last_reviewed timestamptz not null default now(),
  primary key (user_id, medicine_id, section)
);

create table if not exists quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade,
  quiz_type text not null,
  medicine_id text not null,
  correct boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles (id),
  action text not null,
  target text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Auto-create profile row on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Row Level Security
alter table profiles enable row level security;
alter table bookmarks enable row level security;
alter table study_progress enable row level security;
alter table quiz_results enable row level security;
alter table audit_log enable row level security;

create policy "profiles: read own" on profiles for select using (auth.uid() = id);
create policy "profiles: update own" on profiles for update using (auth.uid() = id);

create policy "bookmarks: owner full access" on bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "study_progress: owner full access" on study_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "quiz_results: owner full access" on quiz_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "audit_log: admin read" on audit_log
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "audit_log: admin insert" on audit_log
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
