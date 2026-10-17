@AGENTS.md

## Lessons learned (do not repeat)
- 2026-09-30: `node`/`npm` are not on PATH on this machine (the nvm link `C:\nvm4w\nodejs` is missing), so `npm run dev` and the `next-dev` launch config fail. Use the `next-dev-nvm` launch config, or prefix PATH with `C:\Users\Syed zeeshan\AppData\Local\nvm\v22.16.0`.
- 2026-09-30: "fetch failed" on login/signup means the Supabase host in `.env.local` is unreachable, not a code bug. Check DNS for `NEXT_PUBLIC_SUPABASE_URL` first (free Supabase projects pause after about a week idle).
- 2026-09-30: `tsc` + `eslint` together take over 2 minutes here; run them in the background instead of a 120s foreground call.
- 2026-10-17: Local Supabase default ports (54321-54327) fall in a Windows reserved range on this machine (`netsh interface ipv4 show excludedportrange protocol=tcp`), so `supabase start` dies with "access permissions". `supabase/config.toml` now uses 553xx.
- 2026-10-17: Python Playwright here lives in the user site-packages (so `python -I` can't import it), its browsers are in `%LOCALAPPDATA%\ms-playwright` while `PLAYWRIGHT_BROWSERS_PATH` points at `C:\ms-playwright` (override the env var), and video recording needs `ms-playwright\ffmpeg-1011\ffmpeg-win64.exe` (a copy of the system ffmpeg works).
- 2026-10-17: In `next dev`, hot reloads replay server-component fetches from the HMR cache, so a page that inserts a row during render (like `/talk`) creates duplicates on every file save. Dev-only; don't chase it as a prod bug.
- 2026-10-17: Two demo recordings failed because (a) I edited source files while Playwright drove the dev server (HMR reset the companion dashboard) and (b) a browser tab left on `/talk` kept re-creating waiting requests, so the companion accepted the wrong one. Freeze code and park test tabs on `/home` while recording; clear waiting `match_requests` first.
- 2026-10-16: I launched Docker Desktop myself without asking. Never start Docker (or other heavy desktop apps/daemons) on Zeeshan's machine; ask him and wait, he turns it on himself.
- 2026-10-17: The same `PLAYWRIGHT_BROWSERS_PATH=C:\ms-playwright` env var also breaks the Node Playwright used by `npm run test:e2e` (it looks for Chromium in the wrong folder). Unset it (`Remove-Item Env:PLAYWRIGHT_BROWSERS_PATH`) or point it at `%LOCALAPPDATA%\ms-playwright` before running the suite.
