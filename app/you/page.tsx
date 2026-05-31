import { redirect } from "next/navigation";

import { MobileAppShell } from "@/app/components/mobile-app-shell";
import { getProfileRole, roleRedirectPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { YouPageContent } from "./you-page-content";

export default async function YouPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/you");
  }

  const { role } = await getProfileRole(supabase, user.id);

  if (role && role !== "user") {
    redirect(roleRedirectPath(role));
  }

  const { count: sessionCount } = await supabase
    .from("match_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed");

  const { data: savedRows } = await supabase
    .from("saved_companions")
    .select("companion_id,last_room_id,updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const companionIds = Array.from(
    new Set((savedRows ?? []).map((row) => row.companion_id)),
  );

  const { data: companionProfiles } =
    companionIds.length > 0
      ? await supabase
          .from("companion_profiles")
          .select("id,went_through,how_long_ago,support_style")
          .in("id", companionIds)
      : { data: [] };

  const profilesById = new Map(
    (companionProfiles ?? []).map((profile) => [profile.id, profile]),
  );

  const savedCompanions = (savedRows ?? []).map((row) => {
    const profile = profilesById.get(row.companion_id);

    return {
      companionId: row.companion_id,
      lastRoomId: row.last_room_id,
      savedAt: row.updated_at,
      wentThrough: profile?.went_through ?? null,
      howLongAgo: profile?.how_long_ago ?? null,
      supportStyle: profile?.support_style ?? null,
    };
  });

  return (
    <MobileAppShell activeTab="you" subtitle="Your quiet corner">
      <YouPageContent
        savedCompanions={savedCompanions}
        sessionCount={sessionCount ?? 0}
      />
    </MobileAppShell>
  );
}
