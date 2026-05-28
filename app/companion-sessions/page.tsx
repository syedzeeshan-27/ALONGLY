import { redirect } from "next/navigation";

import { MobileAppShell } from "@/app/components/mobile-app-shell";
import { roleRedirectPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SessionsClient, type SessionRow } from "./sessions-client";

export default async function CompanionSessionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/companion-sessions");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "companion") {
    redirect(roleRedirectPath(profile?.role ?? "user"));
  }

  const { data: companionProfile } = await supabase
    .from("companion_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!companionProfile) {
    redirect("/companion-setup");
  }

  const { data: sessions } = await supabase
    .from("match_requests")
    .select("id,experience_tag,status,created_at")
    .eq("companion_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  const rows: SessionRow[] = (sessions ?? []).map((row) => ({
    id: row.id,
    experience_tag: row.experience_tag ?? "unspecified",
    created_at: row.created_at ?? new Date().toISOString(),
  }));

  return (
    <MobileAppShell
      activeTab="sessions"
      subtitle="Your sessions"
      variant="companion"
    >
      <SessionsClient sessions={rows} />
    </MobileAppShell>
  );
}
