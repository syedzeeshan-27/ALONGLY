import { redirect } from "next/navigation";

import { MobileAppShell } from "@/app/components/mobile-app-shell";
import { roleRedirectPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BriefingsClient } from "./briefings-client";

export default async function CompanionBriefingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/companion-briefings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_online")
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

  return (
    <MobileAppShell
      activeTab="briefings"
      subtitle="About the user"
      variant="companion"
    >
      <BriefingsClient
        companionId={user.id}
        initialIsOnline={Boolean(profile.is_online)}
      />
    </MobileAppShell>
  );
}
