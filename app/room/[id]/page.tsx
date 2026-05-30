import { redirect } from "next/navigation";

import { MobileAppShell } from "@/app/components/mobile-app-shell";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { RoomClient } from "./room-client";

type RoomPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type MatchRequest = Pick<
  Database["public"]["Tables"]["match_requests"]["Row"],
  "id" | "user_id" | "companion_id" | "status" | "voice_room_url"
>;

export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/room/${id}`);
  }

  const { data: matchRequest } = await supabase
    .from("match_requests")
    .select("id,user_id,companion_id,status,voice_room_url")
    .eq("id", id)
    .maybeSingle<MatchRequest>();

  if (
    !matchRequest ||
    (matchRequest.user_id !== user.id && matchRequest.companion_id !== user.id)
  ) {
    redirect("/");
  }

  if (matchRequest.status === "completed") {
    redirect("/");
  }

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id,room_id,sender_id,content,created_at")
    .eq("room_id", id)
    .order("created_at", { ascending: true });

  const isCompanion = matchRequest.companion_id === user.id;

  return (
    <MobileAppShell
      activeTab="chat"
      subtitle={isCompanion ? "Companion room" : "Matched room"}
      variant={isCompanion ? "companion" : "user"}
    >
      <RoomClient
        completedRedirectPath={isCompanion ? "/companion-sessions" : "/sessions"}
        currentUserId={user.id}
        initialMessagesError={messagesError?.message ?? null}
        initialMessages={messages ?? []}
        initialVoiceRoomUrl={matchRequest.voice_room_url ?? null}
        roomId={matchRequest.id}
      />
    </MobileAppShell>
  );
}
