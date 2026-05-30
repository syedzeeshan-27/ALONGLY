"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  getProfileRole,
  isProfileRole,
  postAuthRedirectPath,
  roleRedirectPath,
  upsertProfileRole,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  message?: string;
};

function fieldValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateCredentials(email: string, password: string) {
  if (!email || !email.includes("@")) {
    return "Enter a valid email address.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return null;
}

async function requestOrigin() {
  const headersList = await headers();
  return headersList.get("origin") ?? "http://localhost:3000";
}

export async function signup(
  _state: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState | undefined> {
  const email = fieldValue(formData, "email");
  const password = fieldValue(formData, "password");
  const roleValue = fieldValue(formData, "role");
  const nextPath = fieldValue(formData, "next");
  const credentialError = validateCredentials(email, password);

  if (credentialError) {
    return { error: credentialError };
  }

  if (!isProfileRole(roleValue)) {
    return { error: "Choose user or companion." };
  }

  const supabase = await createClient();
  const redirectPath = roleRedirectPath(roleValue);
  const origin = await requestOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: roleValue },
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(
        redirectPath,
      )}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Could not create the account. Please try again." };
  }

  const profileResult = await upsertProfileRole(
    supabase,
    data.user.id,
    roleValue,
  );

  if (profileResult.error && data.session) {
    return { error: profileResult.error.message };
  }

  if (!data.session) {
    return {
      message:
        "Check your email to confirm your account. Your role will be applied when you finish signing in.",
    };
  }

  redirect(postAuthRedirectPath(nextPath, roleValue));
}

export async function login(
  _state: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState | undefined> {
  const email = fieldValue(formData, "email");
  const password = fieldValue(formData, "password");
  const nextPath = fieldValue(formData, "next");
  const credentialError = validateCredentials(email, password);

  if (credentialError) {
    return { error: credentialError };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Could not sign you in. Please try again." };
  }

  const existingProfile = await getProfileRole(supabase, data.user.id);
  let role = existingProfile.role;

  if (!role) {
    const metadataRole = data.user.user_metadata?.role;
    const fallbackRole = isProfileRole(metadataRole) ? metadataRole : "user";
    const profileResult = await upsertProfileRole(
      supabase,
      data.user.id,
      fallbackRole,
    );

    if (profileResult.error) {
      return { error: profileResult.error.message };
    }

    role = fallbackRole;
  }

  redirect(postAuthRedirectPath(nextPath, role));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
