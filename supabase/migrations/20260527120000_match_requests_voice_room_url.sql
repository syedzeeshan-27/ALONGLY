alter table public.match_requests
  add column if not exists voice_room_url text;
