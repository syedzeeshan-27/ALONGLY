import { execFileSync } from "node:child_process";

/**
 * Where the end-to-end tests get their Supabase connection from, in order:
 *
 *   1. NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY already in the
 *      environment (plus SUPABASE_SERVICE_ROLE_KEY for test clean-up).
 *   2. A running local stack: `supabase status -o env` (what `npx supabase start`
 *      prints). This is what happens on a dev machine and in CI.
 *
 * `.env.local` is deliberately NOT read: it usually points at a hosted project,
 * and these tests create accounts and delete waiting match requests.
 */
export type E2eSupabaseEnv = {
  url: string;
  anonKey: string;
  serviceRoleKey: string | null;
  source: "env" | "supabase status";
};

function parseEnvOutput(output: string) {
  const values: Record<string, string> = {};

  for (const line of output.split(/\r?\n/)) {
    const match = line.match(/^([A-Z_]+)="?(.*?)"?$/);
    if (match) {
      values[match[1]] = match[2];
    }
  }

  return values;
}

function fromSupabaseCli(): E2eSupabaseEnv | null {
  try {
    const output = execFileSync("supabase", ["status", "-o", "env"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      // The CLI ships as supabase.cmd on Windows when installed via npm/scoop shims.
      shell: process.platform === "win32",
    });
    const values = parseEnvOutput(output);
    const url = values.API_URL;
    const anonKey = values.PUBLISHABLE_KEY || values.ANON_KEY;

    if (!url || !anonKey) {
      return null;
    }

    return {
      url,
      anonKey,
      serviceRoleKey: values.SERVICE_ROLE_KEY || values.SECRET_KEY || null,
      source: "supabase status",
    };
  } catch {
    return null;
  }
}

let cached: E2eSupabaseEnv | null | undefined;

export function resolveSupabaseEnv(): E2eSupabaseEnv | null {
  if (cached !== undefined) {
    return cached;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (url && anonKey) {
    cached = {
      url,
      anonKey,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null,
      source: "env",
    };
  } else {
    cached = fromSupabaseCli();
  }

  return cached;
}
