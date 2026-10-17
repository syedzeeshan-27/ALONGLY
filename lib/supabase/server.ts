import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseConfig } from "./config";
import type { Database } from "./types";

export async function createClient() {
  // Read cookies first: it marks the page as dynamic, so `next build` does not
  // try to prerender auth pages (and fail) when the env vars are not set yet.
  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. Server Actions, Route
          // Handlers, and Proxy can, so auth refresh still works there.
        }
      },
    },
  });
}
