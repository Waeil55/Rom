-- Lightweight client-side error visibility: the React ErrorBoundary writes crash reports
-- here so admins have some signal in production without needing a paid third-party service.
create table if not exists client_error_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete set null,
  message text not null,
  stack text,
  route text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table client_error_log enable row level security;

-- Any authenticated user can report an error, but only about themselves; no read access
-- for regular users (avoids leaking other users' stack traces).
create policy "client_error_log: authenticated insert" on client_error_log
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "client_error_log: admin read" on client_error_log
  for select using (is_admin(auth.uid()));
