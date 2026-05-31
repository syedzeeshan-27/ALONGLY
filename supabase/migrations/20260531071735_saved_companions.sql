create table if not exists public.saved_companions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  companion_id uuid not null references public.profiles (id) on delete cascade,
  last_room_id uuid references public.match_requests (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, companion_id),
  constraint saved_companions_distinct_users check (user_id <> companion_id)
);

create index if not exists saved_companions_companion_id_idx
  on public.saved_companions (companion_id);

alter table public.saved_companions enable row level security;

grant select, insert, update, delete on public.saved_companions to authenticated;

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
