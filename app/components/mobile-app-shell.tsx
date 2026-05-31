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

import { BrandMark } from "@/app/components/brand-logo";

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

function Brand({
  title,
  subtitle,
  dotClass,
  showSubtitle = true,
}: {
  title: string;
  subtitle: string;
  dotClass: string;
  showSubtitle?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/75 shadow-sm ring-1 ring-stone-200/70">
        <BrandMark className="h-9 w-9" priority sizes="44px" />
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#fbf7f1] ${dotClass}`}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-lg font-bold leading-tight tracking-tight text-stone-950">
          {title}
        </p>
        {showSubtitle ? (
          <p className="truncate text-xs font-medium text-stone-500">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function BottomTab({ activeTab, item }: { activeTab: ActiveTab; item: NavItem }) {
  const Icon = item.icon;
  const isActive = item.id === activeTab;
  const className = [
    "flex h-[72px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl text-xs font-semibold transition",
    isActive
      ? "bg-orange-50 text-orange-600"
      : "text-stone-400 hover:bg-stone-100/70 hover:text-stone-700",
  ].join(" ");

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
      <Link aria-current={isActive ? "page" : undefined} className={className} href={item.href}>
        {contents}
      </Link>
    );
  }

  return (
    <span aria-disabled="true" className={className}>
      {contents}
    </span>
  );
}

function SideTab({ activeTab, item }: { activeTab: ActiveTab; item: NavItem }) {
  const Icon = item.icon;
  const isActive = item.id === activeTab;
  const className = [
    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
    isActive
      ? "bg-orange-50 text-orange-600 shadow-sm shadow-orange-100"
      : "text-stone-500 hover:bg-stone-100/80 hover:text-stone-800",
  ].join(" ");

  const contents = (
    <>
      <Icon
        aria-hidden="true"
        className={isActive ? "text-orange-500" : "text-stone-400"}
        size={20}
        strokeWidth={isActive ? 2.4 : 2}
      />
      <span className="truncate">{item.label}</span>
    </>
  );

  if (item.href) {
    return (
      <Link aria-current={isActive ? "page" : undefined} className={className} href={item.href}>
        {contents}
      </Link>
    );
  }

  return (
    <span aria-disabled="true" className={className}>
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
  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? title;

  return (
    <main className="mobile-app-viewport bg-[#fbf7f1] text-stone-950">
      <section className="flex h-full w-full flex-col overflow-hidden bg-[#fbf7f1] md:flex-row">
        {hideNav ? null : (
          <aside className="hidden shrink-0 flex-col border-r border-stone-200/70 bg-[#f6f0e8] px-4 py-6 md:flex md:w-60 lg:w-72">
            <div className="px-2">
              <Brand
                dotClass={dotClass}
                showSubtitle={false}
                subtitle={subtitle}
                title={title}
              />
            </div>
            <nav className="mt-8 flex flex-1 flex-col gap-1.5">
              {tabs.map((item) => (
                <SideTab activeTab={activeTab} item={item} key={item.id} />
              ))}
            </nav>
          </aside>
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          {hideNav ? null : (
            <header className="safe-top mobile-app-header shrink-0 border-b border-stone-200/70 bg-[#fbf7f1]/95 px-5 backdrop-blur md:px-7">
              <div className="flex items-center justify-between gap-4 py-3.5">
                <div className="md:hidden">
                  <Brand dotClass={dotClass} subtitle={subtitle} title={title} />
                </div>
                <div className="hidden min-w-0 md:block">
                  <h1 className="truncate text-xl font-bold leading-tight tracking-tight text-stone-950">
                    {activeLabel}
                  </h1>
                  <p className="truncate text-sm font-medium text-stone-500">
                    {subtitle}
                  </p>
                </div>
              </div>
            </header>
          )}

          <div className="min-h-0 flex-1 overflow-hidden">
            <div className="mx-auto h-full w-full max-w-2xl">{children}</div>
          </div>

          {hideNav ? null : (
            <nav className="safe-bottom mobile-bottom-nav shrink-0 border-t border-orange-100/70 bg-[#fbf7f1]/95 px-3 pt-2 backdrop-blur md:hidden">
              <div className={`grid ${gridCols} gap-1`}>
                {tabs.map((item) => (
                  <BottomTab activeTab={activeTab} item={item} key={item.id} />
                ))}
              </div>
            </nav>
          )}
        </div>
      </section>
    </main>
  );
}
