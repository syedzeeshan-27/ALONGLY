import Link from "next/link";
import {
  Heart,
  History,
  Inbox,
  MessageCircle,
  NotebookText,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

type ShellVariant = "user" | "companion";
type ActiveTab =
  | "home"
  | "chat"
  | "you"
  | "queue"
  | "briefings"
  | "sessions"
  | "profile";

type NavItem = {
  id: ActiveTab;
  label: string;
  href?: string;
  icon: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
};

type MobileAppShellProps = {
  activeTab: ActiveTab;
  children: ReactNode;
  subtitle: string;
  title?: string;
  variant?: ShellVariant;
  hideNav?: boolean;
};

const userTabs: NavItem[] = [
  { id: "home", label: "Home", href: "/home", icon: Sparkles },
  { id: "chat", label: "Chat", href: "/chat", icon: MessageCircle },
  { id: "you", label: "You", href: "/you", icon: Heart },
];

const companionTabs: NavItem[] = [
  { id: "queue", label: "Dashboard", href: "/companion-dashboard", icon: Inbox },
  { id: "briefings", label: "User", href: "/companion-briefings", icon: NotebookText },
  { id: "sessions", label: "My Sessions", href: "/companion-sessions", icon: History },
  { id: "profile", label: "Profile", href: "/companion-profile", icon: UserRound },
];

function tabClassName(isActive: boolean) {
  return [
    "flex h-[72px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl text-xs font-semibold transition",
    isActive
      ? "bg-orange-50 text-orange-600"
      : "text-stone-400 hover:bg-stone-100/70 hover:text-stone-700",
  ].join(" ");
}

function MobileTab({ activeTab, item }: { activeTab: ActiveTab; item: NavItem }) {
  const Icon = item.icon;
  const isActive = item.id === activeTab;
  const contents = (
    <>
      <Icon
        aria-hidden="true"
        className={isActive ? "text-orange-500" : "text-stone-400"}
        size={24}
        strokeWidth={isActive ? 2.4 : 2}
      />
      <span className="truncate">{item.label}</span>
    </>
  );

  if (item.href) {
    return (
      <Link className={tabClassName(isActive)} href={item.href}>
        {contents}
      </Link>
    );
  }

  return (
    <span aria-disabled="true" className={tabClassName(isActive)}>
      {contents}
    </span>
  );
}

export function MobileAppShell({
  activeTab,
  children,
  subtitle,
  title = "Alongly",
  variant = "user",
  hideNav = false,
}: MobileAppShellProps) {
  const isCompanion = variant === "companion";
  const tabs = isCompanion ? companionTabs : userTabs;
  const dotClass = isCompanion ? "bg-teal-400" : "bg-emerald-400";
  const gridCols = tabs.length === 4 ? "grid-cols-4" : "grid-cols-3";
  const rowsClass = hideNav
    ? "grid-rows-[auto_minmax(0,1fr)]"
    : "grid-rows-[auto_minmax(0,1fr)_auto]";

  return (
    <main className="min-h-dvh bg-stone-200 text-stone-950 sm:grid sm:place-items-center sm:px-4 sm:py-5">
      <section className={`mx-auto grid h-dvh w-full max-w-md ${rowsClass} overflow-hidden bg-[#fbf7f1] shadow-2xl shadow-stone-950/10 sm:rounded-[26px] sm:border sm:border-white/70`}>
        <header className="safe-top shrink-0 border-b border-stone-200/70 bg-[#fbf7f1]/95 px-5 backdrop-blur">
          <div className="flex items-center justify-between gap-4 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-orange-200 to-orange-300 text-sm font-bold text-orange-700 ring-1 ring-orange-200/60">
                A
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#fbf7f1] ${dotClass}`}
                />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold leading-tight tracking-tight text-stone-950">
                  {title}
                </h1>
                <p className="truncate text-xs font-medium text-stone-500">
                  {subtitle}
                </p>
              </div>
            </div>

          </div>
        </header>

        <div className="min-h-0 overflow-hidden">{children}</div>

        {hideNav ? null : (
          <nav className="safe-bottom shrink-0 border-t border-orange-100/70 bg-[#fbf7f1]/95 px-3 pt-2 backdrop-blur">
            <div className={`grid ${gridCols} gap-1`}>
              {tabs.map((item) => (
                <MobileTab activeTab={activeTab} item={item} key={item.id} />
              ))}
            </div>
          </nav>
        )}
      </section>
    </main>
  );
}
