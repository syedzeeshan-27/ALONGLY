alter table public.messages enable row level security;

grant select, insert on table public.messages to authenticated;

drop policy if exists "Room participants can read messages" on public.messages;
drop policy if exists "Room participants can send messages" on public.messages;

create policy "Room participants can read messages"
on public.messages
for select
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

create policy "Room participants can send messages"
on public.messages
for insert
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

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  )
  and not exists (
    select 1
    from pg_publication_rel
    join pg_class on pg_class.oid = pg_publication_rel.prrelid
    join pg_namespace on pg_namespace.oid = pg_class.relnamespace
    join pg_publication on pg_publication.oid = pg_publication_rel.prpubid
    where pg_publication.pubname = 'supabase_realtime'
      and pg_namespace.nspname = 'public'
      and pg_class.relname = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
