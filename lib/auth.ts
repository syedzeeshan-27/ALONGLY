import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, ProfileRole } from "@/lib/supabase/types";

const roles = new Set<ProfileRole>(["user", "companion"]);

export function isProfileRole(value: unknown): value is ProfileRole {
  return typeof value === "string" && roles.has(value as ProfileRole);
}

export function roleRedirectPath(role: ProfileRole) {
  return role === "companion" ? "/companion-dashboard" : "/home";
}

export function safeRedirectPath(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export function postAuthRedirectPath(value: unknown, role: ProfileRole) {
  const fallback = roleRedirectPath(role);
  const path = safeRedirectPath(value, fallback);

  if (
    path === "/chat" ||
    path.startsWith("/chat/") ||
    path === "/you" ||
    path.startsWith("/you/") ||
    path === "/breathe" ||
    path === "/home" ||
    path.startsWith("/home/")
  ) {
    return role === "user" ? path : fallback;
  }

  if (
    path === "/companion-dashboard" ||
    path.startsWith("/companion-dashboard/")
  ) {
    return role === "companion" ? path : fallback;
  }

  return path;
}

export async function getProfileRole(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !isProfileRole(data?.role)) {
    return { role: null, error };
  }

  return { role: data.role, error: null };
}

export async function upsertProfileRole(
  supabase: SupabaseClient<Database>,
  userId: string,
  role: ProfileRole,
) {
  return supabase.from("profiles").upsert({ id: userId, role }, {
    onConflict: "id",
  });
}
