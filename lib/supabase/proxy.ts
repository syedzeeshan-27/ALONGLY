import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getProfileRole, roleRedirectPath } from "@/lib/auth";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database, ProfileRole } from "@/lib/supabase/types";

const authRoutes = ["/login", "/signup"];
const protectedRoutes = [
  "/chat",
  "/companion-dashboard",
  "/companion-setup",
  "/room",
];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function isAuthRoute(pathname: string) {
  return authRoutes.some((route) => matchesRoute(pathname, route));
}

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => matchesRoute(pathname, route));
}

function isAllowedForRole(pathname: string, role: ProfileRole) {
  if (matchesRoute(pathname, "/chat")) {
    return role === "user";
  }

  if (matchesRoute(pathname, "/companion-dashboard")) {
    return role === "companion";
  }

  if (matchesRoute(pathname, "/companion-setup")) {
    return role === "companion";
  }

  if (matchesRoute(pathname, "/room")) {
    return role === "user" || role === "companion";
  }

  return true;
}

function redirectWithAuthCookies(url: URL, response: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  ["cache-control", "expires", "pragma"].forEach((header) => {
    const value = response.headers.get(header);

    if (value) {
      redirectResponse.headers.set(header, value);
    }
  });

  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });

          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && isProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);

    return redirectWithAuthCookies(url, response);
  }

  if (!user) {
    return response;
  }

  if (!isAuthRoute(pathname) && !isProtectedRoute(pathname)) {
    return response;
  }

  const { role } = await getProfileRole(supabase, user.id);
  const resolvedRole = role ?? "user";

  if (isAuthRoute(pathname) || !isAllowedForRole(pathname, resolvedRole)) {
    const url = request.nextUrl.clone();
    url.pathname = roleRedirectPath(resolvedRole);
    url.search = "";

    return redirectWithAuthCookies(url, response);
  }

  return response;
}
