import { redirect } from "next/navigation";

import { MobileAppShell } from "@/app/components/mobile-app-shell";
import { getProfileRole, roleRedirectPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MatchWaiting } from "./match-waiting";

// Direct route for the "Talk to someone" / "Talk to this style" buttons.
// Unlike "Find a companion" (which keeps the full AI intake), this creates a
// live request straight away and waits for any online companion to accept it.
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

    // The database allows one waiting request per person, so a double render
    // (or a quick refresh) lands here: reuse the request that already exists.
    if (insertError?.code === "23505") {
      const { data: openRequest } = await supabase
        .from("match_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "waiting")
        .maybeSingle();

      if (openRequest) {
        requestId = openRequest.id;
      } else {
        redirect("/chat");
      }
    } else if (insertError) {
      // Anything else: fall back to the normal flow rather than break.
      redirect("/chat");
    }
  }

  return (
    <MobileAppShell activeTab="chat" subtitle="Finding your person">
      <MatchWaiting requestId={requestId} userId={user.id} />
    </MobileAppShell>
  );
}
