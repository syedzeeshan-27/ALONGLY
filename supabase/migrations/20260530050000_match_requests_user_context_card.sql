alter table public.match_requests
  add column if not exists user_context_card text;
