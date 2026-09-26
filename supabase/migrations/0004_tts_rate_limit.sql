-- Tracks AI Listen usage per user so the edge function can enforce a rate limit
-- and stop a compromised/abused client from running up the OpenAI bill.
create table if not exists tts_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists tts_usage_user_time_idx on tts_usage (user_id, created_at);

alter table tts_usage enable row level security;

-- The edge function writes/reads using the caller's own JWT (not service role),
-- so it needs standard owner policies like the other per-user tables.
create policy "tts_usage: owner full access" on tts_usage
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tts_usage: admin read" on tts_usage
  for select using (is_admin(auth.uid()));

-- Housekeeping: old rows aren't needed once they age out of the rate-limit window.
create or replace function prune_old_tts_usage()
returns void as $$
  delete from tts_usage where created_at < now() - interval '2 hours';
$$ language sql security definer;
