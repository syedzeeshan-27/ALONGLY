import { redirect } from "next/navigation";

import { MobileAppShell } from "@/app/components/mobile-app-shell";
import { getProfileRole, roleRedirectPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { YouClient } from "./you-client";

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

  return (
    <MobileAppShell activeTab="you" subtitle="Your quiet corner">
      <YouClient />
    </MobileAppShell>
  );
}
