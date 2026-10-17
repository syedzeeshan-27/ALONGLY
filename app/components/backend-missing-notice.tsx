import Link from "next/link";

import { REPO_URL } from "@/lib/site";

// Shown on login/signup when the deployment has no Supabase project behind
// it (for example a showcase deploy of the open-source repo).
export function BackendMissingNotice() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
      <p>
        This copy of Alongly is a code showcase and isn&apos;t connected to a
        database, so accounts can&apos;t be created here.
      </p>
      <p>
        To try the full flow (intake chat, live companion queue, matched room),
        run it locally in a few minutes with the README, or watch the demo.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          className="inline-flex h-10 items-center rounded-xl bg-amber-900 px-4 font-semibold text-white transition hover:bg-amber-800"
          href={REPO_URL}
          rel="noreferrer"
          target="_blank"
        >
          View the code
        </a>
        <a
          className="inline-flex h-10 items-center rounded-xl border border-amber-300 bg-white px-4 font-semibold text-amber-900 transition hover:bg-amber-100"
          href={`${REPO_URL}#readme`}
          rel="noreferrer"
          target="_blank"
        >
          Watch the demo
        </a>
      </div>
      <p className="text-xs text-amber-800/80">
        Running this yourself? Copy <code>.env.example</code> to{" "}
        <code>.env.local</code> and add your Supabase URL and anon key.{" "}
        <Link className="underline underline-offset-2" href="/">
          Back to the landing page
        </Link>
        .
      </p>
    </div>
  );
}
