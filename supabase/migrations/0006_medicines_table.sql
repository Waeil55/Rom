-- Admin-added medications, layered on top of the static Day 1 curriculum at read time.
create table if not exists medicines (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  generic_name text not null,
  pronunciation text,
  drug_class text not null,
  mechanism text not null default '',
  indications text not null default '',
  dosage text not null default '',
  contraindications text not null default '',
  warnings text not null default '',
  side_effects text not null default '',
  interactions text not null default '',
  monitoring text not null default '',
  counseling text not null default '',
  pearls text not null default '',
  source text not null default 'manual' check (source in ('manual', 'ai-extracted')),
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists medicines_drug_class_idx on medicines (drug_class);
create index if not exists medicines_generic_name_idx on medicines (generic_name);

alter table medicines enable row level security;

-- Every signed-in user can read the shared library; only admins can add or edit.
create policy "medicines: authenticated read" on medicines
  for select using (auth.uid() is not null);

create policy "medicines: admin insert" on medicines
  for insert with check (is_admin(auth.uid()));

create policy "medicines: admin update" on medicines
  for update using (is_admin(auth.uid()));

create policy "medicines: admin delete" on medicines
  for delete using (is_admin(auth.uid()));

create or replace function set_medicines_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_medicines_update on medicines;
create trigger on_medicines_update
  before update on medicines
  for each row execute procedure set_medicines_updated_at();
