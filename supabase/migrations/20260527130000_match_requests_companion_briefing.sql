alter table public.match_requests
  add column if not exists companion_briefing text;
