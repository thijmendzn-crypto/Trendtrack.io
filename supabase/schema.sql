create table if not exists public.workspaces (
  actor_id text primary key,
  saved integer[] not null default '{}',
  leads jsonb not null default '[]'::jsonb,
  checkout_sessions jsonb not null default '[]'::jsonb,
  store_connected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists workspaces_set_updated_at on public.workspaces;

create trigger workspaces_set_updated_at
before update on public.workspaces
for each row
execute function public.set_updated_at();

alter table public.workspaces enable row level security;

drop policy if exists "service role manages workspaces" on public.workspaces;

create policy "service role manages workspaces"
on public.workspaces
for all
to service_role
using (true)
with check (true);
