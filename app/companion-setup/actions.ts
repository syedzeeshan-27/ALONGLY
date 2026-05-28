"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type CompanionSetupState = {
  error?: string;
};

export type StyleUpdateState = {
  error?: string;
  ok?: boolean;
};

const timeOptions = new Set([
  "less than 6 months",
  "6-12 months",
  "1-2 years",
  "more than 2 years",
]);

const supportStyles = new Set([
  "calm listener",
  "practical thinker",
  "warm encourager",
]);

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function saveCompanionSetup(
  _state: CompanionSetupState | undefined,
  formData: FormData,
): Promise<CompanionSetupState | undefined> {
  const wentThrough = formValue(formData, "went_through");
  const howLongAgo = formValue(formData, "how_long_ago");
  const supportStyle = formValue(formData, "support_style");

  if (!wentThrough) {
    return { error: "Tell us what you went through." };
  }

  if (wentThrough.length > 200) {
    return { error: "Keep your answer under 200 characters." };
  }

  if (!timeOptions.has(howLongAgo)) {
    return { error: "Choose how long ago it happened." };
  }

  if (!supportStyles.has(supportStyle)) {
    return { error: "Choose your companion style." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/companion-setup");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "companion") {
    redirect("/");
  }

  const { data: existingProfile } = await supabase
    .from("companion_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    redirect("/companion-dashboard");
  }

  const { error } = await supabase.from("companion_profiles").insert({
    id: user.id,
    went_through: wentThrough,
    how_long_ago: howLongAgo,
    support_style: supportStyle,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/companion-dashboard");
}

export async function updateSupportStyle(
  _state: StyleUpdateState | undefined,
  formData: FormData,
): Promise<StyleUpdateState | undefined> {
  const supportStyle = formValue(formData, "support_style");

  if (!supportStyles.has(supportStyle)) {
    return { error: "Choose your companion style." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/companion-profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "companion") {
    redirect("/");
  }

  const { error } = await supabase
    .from("companion_profiles")
    .update({ support_style: supportStyle })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/companion-profile");
  return { ok: true };
}
