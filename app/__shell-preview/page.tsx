import { MobileAppShell } from "@/app/components/mobile-app-shell";

export default function ShellPreviewPage() {
  return (
    <MobileAppShell activeTab="profile" subtitle="Your space" variant="companion">
      <section className="mobile-scroll flex h-full flex-col gap-6 overflow-y-auto px-5 py-6">
        <div className="flex items-center gap-4 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white p-5 shadow-sm">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-teal-600 shadow-sm">
            ♥
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="text-3xl font-bold leading-none text-stone-950">12</p>
            <p className="text-sm font-medium text-stone-500">people you&apos;ve sat with</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-orange-100 bg-white/80 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
            Your story
          </p>
          <p className="text-base leading-7 text-stone-800">a difficult break up</p>
          <p className="text-xs text-stone-400">6–12 months ago</p>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-orange-100 bg-white/80 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
            Your style
          </p>
          {["Calm Listener", "Practical Thinker", "Warm Encourager"].map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-3 rounded-2xl border bg-white p-3.5 ${
                i === 2 ? "border-orange-400 bg-orange-50" : "border-stone-200"
              }`}
            >
              <span className="h-4 w-4 rounded-full border-2 border-orange-400" />
              <span className="text-sm font-bold text-stone-900">{s}</span>
            </div>
          ))}
        </div>
      </section>
    </MobileAppShell>
  );
}
