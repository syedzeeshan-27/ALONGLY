-- Alongly: full database setup for a brand-new Supabase project.
--
-- How to use: Supabase Dashboard -> SQL Editor -> New query -> paste this whole
-- file -> Run. It is safe to run more than once.
--
-- This creates every table the app needs, the row-level security rules, the
-- trigger that gives each new account a profile, and turns on realtime for
-- messages and match requests. It already includes everything from
-- supabase/migrations, so you do not need to run those separately.

-- ── 1. Tables ───────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'user',
  is_online  boolean default false,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('user', 'companion'));
  end if;
end $$;

create table if not exists public.companion_profiles (
  id            uuid primary key references public.profiles (id) on delete cascade,
  went_through  text not null,
  how_long_ago  text not null,
  support_style text not null,
  created_at    timestamptz default now()
);

-- A match request doubles as the chat room: messages.room_id points at it.
create table if not exists public.match_requests (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users (id) on delete cascade,
  user_email         text,
  companion_id       uuid references auth.users (id) on delete set null,
  experience_tag     text,
  intensity_tag      text,
  style_tag          text,
  status             text default 'waiting',
  voice_room_url     text,
  companion_briefing text,
  user_context_card  text,
  created_at         timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'match_requests_status_check'
  ) then
    alter table public.match_requests
      add constraint match_requests_status_check
      check (status in ('waiting', 'matched', 'completed'));
  end if;
end $$;

create index if not exists match_requests_status_created_at_idx
  on public.match_requests (status, created_at);
create index if not exists match_requests_user_id_idx
  on public.match_requests (user_id);
create index if not exists match_requests_companion_id_idx
  on public.match_requests (companion_id);

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  room_id    uuid not null references public.match_requests (id) on delete cascade,
  sender_id  uuid not null references auth.users (id) on delete cascade,
  content    text not null,
  created_at timestamptz default now()
);

create index if not exists messages_room_id_created_at_idx
  on public.messages (room_id, created_at);

create table if not exists public.saved_companions (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  companion_id uuid not null references public.profiles (id) on delete cascade,
  last_room_id uuid references public.match_requests (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (user_id, companion_id),
  constraint saved_companions_distinct_users check (user_id <> companion_id)
);

create index if not exists saved_companions_companion_id_idx
  on public.saved_companions (companion_id);

-- ── 2. Access: only signed-in users, and only through the rules below ───────

alter table public.profiles           enable row level security;
alter table public.companion_profiles enable row level security;
alter table public.match_requests     enable row level security;
alter table public.messages           enable row level security;
alter table public.saved_companions   enable row level security;

revoke all on public.profiles, public.companion_profiles, public.match_requests,
  public.messages, public.saved_companions from anon;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.companion_profiles to authenticated;
grant select, insert, update on public.match_requests to authenticated;
grant select, insert on public.messages to authenticated;
grant select, insert, update, delete on public.saved_companions to authenticated;

-- profiles: you can see and manage only your own row.
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

-- companion_profiles: companions manage their own; a user can read the
-- profile of a companion they were matched with or saved.
drop policy if exists "Companion profiles are readable by owner and their users"
  on public.companion_profiles;
create policy "Companion profiles are readable by owner and their users"
  on public.companion_profiles for select
  to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1
      from public.saved_companions
      where saved_companions.companion_id = companion_profiles.id
        and saved_companions.user_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.match_requests
      where match_requests.companion_id = companion_profiles.id
        and match_requests.user_id = (select auth.uid())
    )
  );

drop policy if exists "Companions can create their profile"
  on public.companion_profiles;
create policy "Companions can create their profile"
  on public.companion_profiles for insert
  to authenticated
  with check (
    id = (select auth.uid())
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'companion'
    )
  );

drop policy if exists "Companions can update their profile"
  on public.companion_profiles;
create policy "Companions can update their profile"
  on public.companion_profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- match_requests: the two people in a request can see it; companions can also
-- see requests that are still waiting so they can accept one.
drop policy if exists "Participants and companions can read match requests"
  on public.match_requests;
create policy "Participants and companions can read match requests"
  on public.match_requests for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or companion_id = (select auth.uid())
    or (
      status = 'waiting'
      and exists (
        select 1
        from public.profiles
        where profiles.id = (select auth.uid())
          and profiles.role = 'companion'
      )
    )
  );

drop policy if exists "Users can create their own match requests"
  on public.match_requests;
create policy "Users can create their own match requests"
  on public.match_requests for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and companion_id is null
    and status = 'waiting'
  );

drop policy if exists "Companions can accept waiting match requests"
  on public.match_requests;
create policy "Companions can accept waiting match requests"
  on public.match_requests for update
  to authenticated
  using (
    status = 'waiting'
    and companion_id is null
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'companion'
    )
  )
  with check (
    companion_id = (select auth.uid())
    and status = 'matched'
  );

drop policy if exists "Participants can update their match requests"
  on public.match_requests;
create policy "Participants can update their match requests"
  on public.match_requests for update
  to authenticated
  using (
    user_id = (select auth.uid())
    or companion_id = (select auth.uid())
  )
  with check (
    user_id = (select auth.uid())
    or companion_id = (select auth.uid())
  );

-- messages: only the two people in a matched room can read and send.
drop policy if exists "Room participants can read messages" on public.messages;
create policy "Room participants can read messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1
      from public.match_requests
      where match_requests.id = messages.room_id
        and match_requests.status = 'matched'
        and (
          match_requests.user_id = (select auth.uid())
          or match_requests.companion_id = (select auth.uid())
        )
    )
  );

drop policy if exists "Room participants can send messages" on public.messages;
create policy "Room participants can send messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1
      from public.match_requests
      where match_requests.id = messages.room_id
        and match_requests.status = 'matched'
        and (
          match_requests.user_id = (select auth.uid())
          or match_requests.companion_id = (select auth.uid())
        )
    )
  );

-- saved_companions: a user manages their own saved list.
drop policy if exists "Users can read saved companions" on public.saved_companions;
create policy "Users can read saved companions"
  on public.saved_companions for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can save companions" on public.saved_companions;
create policy "Users can save companions"
  on public.saved_companions for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can update saved companions" on public.saved_companions;
create policy "Users can update saved companions"
  on public.saved_companions for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can remove saved companions" on public.saved_companions;
create policy "Users can remove saved companions"
  on public.saved_companions for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ── 3. Give every new account a profile row ─────────────────────────────────
-- The role comes from the signup form (options.data.role); anything unknown
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

-- ── 4. Realtime for live messages and the companion queue ───────────────────
do $$
declare
  realtime_table text;
begin
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    return;
  end if;

  foreach realtime_table in array array['messages', 'match_requests'] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = realtime_table
    ) then
      execute format(
        'alter publication supabase_realtime add table public.%I',
        realtime_table
      );
    end if;
  end loop;
end $$;
