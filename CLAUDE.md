@AGENTS.md

## Lessons learned (do not repeat)
- 2026-09-30: `node`/`npm` are not on PATH on this machine (the nvm link `C:\nvm4w\nodejs` is missing), so `npm run dev` and the `next-dev` launch config fail. Use the `next-dev-nvm` launch config, or prefix PATH with `C:\Users\Syed zeeshan\AppData\Local\nvm\v22.16.0`.
- 2026-09-30: "fetch failed" on login/signup means the Supabase host in `.env.local` is unreachable, not a code bug. Check DNS for `NEXT_PUBLIC_SUPABASE_URL` first (free Supabase projects pause after about a week idle).
- 2026-09-30: `tsc` + `eslint` together take over 2 minutes here; run them in the background instead of a 120s foreground call.
