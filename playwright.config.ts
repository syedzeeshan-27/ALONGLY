import { defineConfig, devices } from "@playwright/test";

import { resolveSupabaseEnv } from "./e2e/env";

// Two Next.js servers are started for a run:
//   - "no-supabase" (port 3301): a production build + `next start` with the
//     Supabase variables blanked out, to check the "fresh clone without
//     .env.local" behaviour. Used by no-supabase.spec.ts.
//   - "app" (port 3300): `next dev` pointed at a local Supabase, with no
//     Anthropic key so the intake runs in demo mode. Used by landing.spec.ts
//     and match-flow.spec.ts.
// Playwright starts them in order, so the build has finished before the dev
// server (which shares the .next folder, in .next/dev) comes up.

const APP_PORT = 3300;
const NO_SUPABASE_PORT = 3301;

const supabase = resolveSupabaseEnv();

if (!supabase) {
  throw new Error(
    [
      "The e2e tests need a Supabase project to sign test accounts up against.",
      "Either run `npx supabase start` (Docker) so `supabase status` can be read,",
      "or set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "(and SUPABASE_SERVICE_ROLE_KEY for clean-up) in the environment.",
    ].join(" "),
  );
}

const sharedServerEnv = {
  ...process.env,
  // Demo intake, never a paid call, even if .env.local has a key.
  ANTHROPIC_API_KEY: "",
  NEXT_TELEMETRY_DISABLED: "1",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    ...devices["Desktop Chrome"],
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "no-supabase",
      testMatch: /no-supabase\.spec\.ts/,
      use: { baseURL: `http://localhost:${NO_SUPABASE_PORT}` },
    },
    {
      name: "app",
      testMatch: /(landing|match-flow)\.spec\.ts/,
      use: { baseURL: `http://localhost:${APP_PORT}` },
    },
  ],
  webServer: [
    {
      command: `npx next build && npx next start --port ${NO_SUPABASE_PORT}`,
      url: `http://localhost:${NO_SUPABASE_PORT}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: {
        ...sharedServerEnv,
        NEXT_PUBLIC_SUPABASE_URL: "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      },
    },
    {
      command: `npx next dev --port ${APP_PORT}`,
      url: `http://localhost:${APP_PORT}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        ...sharedServerEnv,
        NEXT_PUBLIC_SUPABASE_URL: supabase.url,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabase.anonKey,
      },
    },
  ],
});
