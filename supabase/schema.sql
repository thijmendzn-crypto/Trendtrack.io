-- Shops: real Shopify stores
create table if not exists public.shops (
  id bigint generated always as identity primary key,
  name text not null,
  domain text unique not null,
  logo_url text,
  storefront_url text,
  category text not null default 'General',
  country text not null default 'US',
  currency text not null default 'USD',
  monthly_visits text not null default 'Unknown',
  meta_ads integer not null default 0,
  live_ads integer not null default 0,
  products integer not null default 0,
  trustpilot text not null default 'N/A',
  traffic integer[] not null default '{}',
  ad_trend integer[] not null default '{}',
  best_sellers text[] not null default '{}',
  ad_images text[] not null default '{}',
  email_images text[] not null default '{}',
  insight text not null default '',
  refreshed_at timestamptz not null default now()
);

alter table public.shops enable row level security;
drop policy if exists "service role manages shops" on public.shops;
create policy "service role manages shops" on public.shops for all to service_role using (true) with check (true);
drop policy if exists "public read shops" on public.shops;
create policy "public read shops" on public.shops for select to anon using (true);

-- Meta token storage for auto-refresh
create table if not exists public.meta_token (
  id integer primary key default 1,
  token text not null,
  refreshed_at timestamptz not null default now()
);
alter table public.meta_token enable row level security;
drop policy if exists "service role manages meta_token" on public.meta_token;
create policy "service role manages meta_token" on public.meta_token for all to service_role using (true) with check (true);

-- Signals: trending products from Amazon + Google Trends
create table if not exists public.signals (
  id bigint generated always as identity primary key,
  name text not null,
  market text not null,
  source text not null,
  score integer not null default 0,
  intent integer not null default 0,
  speed text not null default '0%',
  status text not null default 'rising',
  angle text not null default '',
  refreshed_at timestamptz not null default now()
);

alter table public.signals enable row level security;
drop policy if exists "service role manages signals" on public.signals;
create policy "service role manages signals" on public.signals for all to service_role using (true) with check (true);
drop policy if exists "public read signals" on public.signals;
create policy "public read signals" on public.signals for select to anon using (true);

-- Ads: from Meta Ad Library
create table if not exists public.ads (
  id bigint generated always as identity primary key,
  brand text not null,
  ad_id text unique,
  hook text not null default '',
  spend text not null default 'Unknown',
  format text not null default 'Image',
  lift text not null default '0%',
  image_url text,
  page_name text,
  ad_url text,
  refreshed_at timestamptz not null default now()
);

alter table public.ads enable row level security;
drop policy if exists "service role manages ads" on public.ads;
create policy "service role manages ads" on public.ads for all to service_role using (true) with check (true);
drop policy if exists "public read ads" on public.ads;
create policy "public read ads" on public.ads for select to anon using (true);

-- Emails: from Milled
create table if not exists public.emails (
  id bigint generated always as identity primary key,
  brand text not null,
  subject text not null default '',
  image_url text,
  milled_url text,
  refreshed_at timestamptz not null default now()
);

alter table public.emails enable row level security;
drop policy if exists "service role manages emails" on public.emails;
create policy "service role manages emails" on public.emails for all to service_role using (true) with check (true);
drop policy if exists "public read emails" on public.emails;
create policy "public read emails" on public.emails for select to anon using (true);

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
