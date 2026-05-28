import { redirect } from "next/navigation";

import { MobileAppShell } from "@/app/components/mobile-app-shell";
import { roleRedirectPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CompanionSetupForm } from "./setup-form";

export default async function CompanionSetupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/companion-setup");
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

  if (companionProfile) {
    redirect("/companion-dashboard");
  }

  return (
    <MobileAppShell
      activeTab="profile"
      hideNav
      subtitle="Companion profile"
      variant="companion"
    >
      <section className="mobile-scroll h-full overflow-y-auto px-5 py-5">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-orange-600">
            Setup
          </p>
          <h2 className="mt-1 text-2xl font-bold text-stone-950">
            Tell people what you can support.
          </h2>
        </div>
        <CompanionSetupForm />
      </section>
    </MobileAppShell>
  );
}
