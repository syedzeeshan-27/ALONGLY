import { redirect } from "next/navigation";

import { MobileAppShell } from "@/app/components/mobile-app-shell";
import { roleRedirectPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./profile-client";

export default async function CompanionProfilePage() {
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
    redirect(roleRedirectPath(profile?.role ?? "user"));
  }

  const { data: companionProfile } = await supabase
    .from("companion_profiles")
    .select("went_through,how_long_ago,support_style")
    .eq("id", user.id)
    .maybeSingle();

  if (!companionProfile) {
    redirect("/companion-setup");
  }

  const { count: sessionCount } = await supabase
    .from("match_requests")
    .select("id", { count: "exact", head: true })
    .eq("companion_id", user.id)
    .eq("status", "completed");

  return (
    <MobileAppShell
      activeTab="profile"
      subtitle="Your space"
      variant="companion"
    >
      <ProfileClient
        howLongAgo={companionProfile.how_long_ago}
        sessionCount={sessionCount ?? 0}
        supportStyle={companionProfile.support_style}
        wentThrough={companionProfile.went_through}
      />
    </MobileAppShell>
  );
}
