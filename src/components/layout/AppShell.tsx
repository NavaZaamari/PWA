import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LibraryBig, Search, UserRound } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { fa } from "@/i18n/fa";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: fa.nav.home, icon: Home, exact: true },
  { to: "/search", label: fa.nav.search, icon: Search },
  { to: "/shelves", label: fa.nav.shelves, icon: LibraryBig },
  { to: "/profile", label: fa.nav.profile, icon: UserRound },
] as const;

function useActive() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (to: string, exact?: boolean) => (exact ? path === to : path.startsWith(to));
}

/** App chrome: top bar on desktop, dark-olive bottom tab bar on mobile. */
export function AppShell({ children }: { children: ReactNode }) {
  const isActive = useActive();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh overflow-x-clip">
      {/* Desktop top bar */}
      <header className="sticky top-0 z-40 hidden bg-olive-dark/95 text-cream shadow-card backdrop-blur lg:block">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link to="/" aria-label={fa.nav.home} className="rounded-xl">
            <Logo size="sm" className="bg-cream/10" />
          </Link>
          <nav aria-label={fa.nav.main} className="flex items-center gap-1">
            {TABS.map(({ to, label, icon: Icon, ...t }) => {
              const active = isActive(to, "exact" in t);
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "tap flex items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors",
                    active ? "bg-cream/12 text-cream" : "text-cream/70 hover:bg-cream/8 hover:text-cream",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main
        key={path}
        className="safe-bottom mx-auto w-full max-w-2xl animate-page-in px-4 pt-[calc(var(--safe-top)+1rem)] lg:max-w-5xl lg:px-6 lg:pt-8 lg:pb-16"
      >
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label={fa.nav.main}
        className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl bg-olive-dark pb-[var(--safe-bottom)] text-cream shadow-lift lg:hidden"
      >
        <ul className="mx-auto grid h-[var(--nav-height)] max-w-md grid-cols-4">
          {TABS.map(({ to, label, icon: Icon, ...t }) => {
            const active = isActive(to, "exact" in t);
            return (
              <li key={to} className="flex">
                <Link
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex flex-1 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold transition-colors",
                    active ? "text-cream" : "text-cream/60 hover:text-cream/85",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-14 items-center justify-center rounded-full transition-all",
                      active && "bg-cream/14",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden strokeWidth={active ? 2.4 : 1.9} />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
