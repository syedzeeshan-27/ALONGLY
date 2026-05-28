import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import {
  getProfileRole,
  isProfileRole,
  postAuthRedirectPath,
  roleRedirectPath,
  safeRedirectPath,
  upsertProfileRole,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function redirectToLogin(origin: string) {
  const url = new URL("/login", origin);
  url.searchParams.set("error", "confirmation");
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const code = requestUrl.searchParams.get("code");
  const nextPath = safeRedirectPath(
    requestUrl.searchParams.get("next"),
    "/login",
  );
  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      return redirectToLogin(requestUrl.origin);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return redirectToLogin(requestUrl.origin);
    }
  } else {
    return redirectToLogin(requestUrl.origin);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectToLogin(requestUrl.origin);
  }

  const existingProfile = await getProfileRole(supabase, user.id);
  let role = existingProfile.role;

  if (!role && isProfileRole(user.user_metadata?.role)) {
    const profileResult = await upsertProfileRole(
      supabase,
      user.id,
      user.user_metadata.role,
    );

    if (!profileResult.error) {
      role = user.user_metadata.role;
    }
  }

  const redirectPath = role
    ? postAuthRedirectPath(nextPath, role)
    : roleRedirectPath("user");

  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
}
