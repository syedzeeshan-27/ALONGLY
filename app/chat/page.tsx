import { redirect } from "next/navigation";

import { MobileAppShell } from "@/app/components/mobile-app-shell";
import { getProfileRole, roleRedirectPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ChatClient } from "./chat-client";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/chat");
  }

  const { role } = await getProfileRole(supabase, user.id);

  if (role && role !== "user") {
    redirect(roleRedirectPath(role));
  }

  // If the user already has a live matched room, the Chat tab should take them
  // back into that ongoing conversation instead of restarting the AI intake.
  // (This is what made an in-progress companion chat appear to "disappear"
  // after switching tabs.)
  const { data: activeRoom } = await supabase
    .from("match_requests")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "matched")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeRoom) {
    redirect(`/room/${activeRoom.id}`);
  }

  return (
    <MobileAppShell activeTab="chat" subtitle="Always here for you">
      <ChatClient userEmail={user.email ?? null} userId={user.id} />
    </MobileAppShell>
  );
}
