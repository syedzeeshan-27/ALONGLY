-- Profiles table + auto-provision trigger.
--
-- The profiles table was originally created directly in the Supabase dashboard
-- and was never tracked in a migration. This migration codifies it and, more
-- importantly, adds a trigger so EVERY new auth user reliably gets a profile
-- row with the role chosen at signup — even if the app-side upsert is skipped
-- or blocked. Everything here is idempotent and safe to run against the
-- existing project.

-- ── Table ──────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'user',
  is_online  boolean default false,
  created_at timestamptz not null default now()
);

-- Backfill columns in case an older/partial table already existed.
alter table public.profiles
  add column if not exists is_online boolean default false;
alter table public.profiles
  add column if not exists created_at timestamptz not null default now();

-- Constrain role to known values (added defensively, only if missing).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('user', 'companion'));
  end if;
end $$;

-- ── Row-level security ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- A signed-in user can read and manage only their own profile row.
drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

grant select, insert, update on public.profiles to authenticated;

-- ── Auto-provision trigger ───────────────────────────────────────────────────
-- Runs as SECURITY DEFINER so the initial insert bypasses RLS. The role is read
-- from the signup metadata (options.data.role) and validated; anything unknown
-- falls back to 'user'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  desired_role text;
begin
  desired_role := coalesce(new.raw_user_meta_data->>'role', 'user');
  if desired_role not in ('user', 'companion') then
    desired_role := 'user';
  end if;

  insert into public.profiles (id, role)
  values (new.id, desired_role)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
