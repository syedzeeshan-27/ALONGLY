import { redirect } from "next/navigation";

import { MobileAppShell } from "@/app/components/mobile-app-shell";
import { getProfileRole, roleRedirectPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { UserSessionsClient, type UserSessionRow } from "./sessions-client";

export default async function UserSessionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/sessions");
  }

  const { role } = await getProfileRole(supabase, user.id);

  if (role && role !== "user") {
    redirect(roleRedirectPath(role));
  }

  const { data: sessions } = await supabase
    .from("match_requests")
    .select(
      "id,experience_tag,intensity_tag,style_tag,companion_briefing,voice_room_url,created_at",
    )
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  const rows: UserSessionRow[] = (sessions ?? []).map((row) => ({
    id: row.id,
    companion_briefing: row.companion_briefing ?? null,
    created_at: row.created_at ?? new Date().toISOString(),
    experience_tag: row.experience_tag ?? "unspecified",
    intensity_tag: row.intensity_tag ?? "unspecified",
    style_tag: row.style_tag ?? "unspecified",
    voice_room_url: row.voice_room_url ?? null,
  }));

  return (
    <MobileAppShell activeTab="you" subtitle="Your session trail">
      <UserSessionsClient sessions={rows} />
    </MobileAppShell>
  );
}
