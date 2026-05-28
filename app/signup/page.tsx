import { isProfileRole } from "@/lib/auth";
import type { ProfileRole } from "@/lib/supabase/types";
import { SignupForm } from "./signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string | string[] }>;
}) {
  const { role: roleParam } = await searchParams;
  const candidate = Array.isArray(roleParam) ? roleParam[0] : roleParam;
  const initialRole: ProfileRole = isProfileRole(candidate) ? candidate : "user";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_top,_#fdf6ec_0%,_#fbf7f1_55%,_#f3faf9_100%)] px-5 py-12">
      <section className="w-full max-w-md rounded-[28px] border border-white/80 bg-white/85 p-8 shadow-xl shadow-stone-300/20 backdrop-blur">
        <div className="mb-8 text-center">
          <h1 className="text-[1.7rem] font-bold tracking-tight text-stone-950">
            Create an account
          </h1>
        </div>

        <SignupForm initialRole={initialRole} />
      </section>
    </main>
  );
}
