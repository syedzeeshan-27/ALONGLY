import { redirect } from "next/navigation";

import { MobileAppShell } from "@/app/components/mobile-app-shell";
import { getProfileRole, roleRedirectPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MatchWaiting } from "./match-waiting";

// Demo shortcut for the 3 showcase companions (Asha / Noor / Rey).
// Unlike "Find a companion" (which keeps the full AI onboarding), tapping
// "Talk to this style" creates a live request directly and waits for the
// founding companion to accept it from the dashboard — no AI intake.
// Everything else in the app is unchanged.
export default async function TalkPage({
  searchParams,
}: {
  searchParams: Promise<{ style?: string | string[] }>;
}) {
  const { style: styleParam } = await searchParams;
  const styleRaw = Array.isArray(styleParam) ? styleParam[0] : styleParam;
  const styleLabel =
    typeof styleRaw === "string" && styleRaw.trim()
      ? styleRaw.trim().slice(0, 40)
      : "Companion";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rooms require auth — send new visitors through the normal signup, then back
  // here to continue the match.
  if (!user) {
    redirect(
      `/signup?role=user&next=${encodeURIComponent(`/talk?style=${styleLabel}`)}`,
    );
  }

  const { role } = await getProfileRole(supabase, user.id);
  if (role && role !== "user") {
    redirect(roleRedirectPath(role));
  }

  // Reuse an existing active request so a refresh doesn't create duplicates.
  const { data: existing } = await supabase
    .from("match_requests")
    .select("id,status")
    .eq("user_id", user.id)
    .in("status", ["waiting", "matched"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let requestId: string;

  if (existing?.status === "matched") {
    redirect(`/room/${existing.id}`);
  }

  if (existing?.status === "waiting") {
    requestId = existing.id;
  } else {
    requestId = crypto.randomUUID();
    const { error: insertError } = await supabase.from("match_requests").insert({
      id: requestId,
      user_id: user.id,
      user_email: user.email ?? null,
      experience_tag: "Direct match",
      style_tag: styleLabel,
      status: "waiting",
    });

    // If something goes wrong, fall back to the normal flow rather than break.
    if (insertError) {
      redirect("/chat");
    }
  }

  return (
    <MobileAppShell activeTab="chat" subtitle="Finding your person">
      <MatchWaiting requestId={requestId} userId={user.id} />
    </MobileAppShell>
  );
}
