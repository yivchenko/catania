import { Heart, Home, Map, Moon, Sun, UserRound, Utensils } from "lucide-react";
import { type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useGuide } from "../hooks/useGuideState";

const tabs = [
  { to: "/", label: "Огляд", icon: Home },
  { to: "/places", label: "Місця", icon: Map },
  { to: "/food", label: "Їжа", icon: Utensils },
  { to: "/memories", label: "Мій список", icon: UserRound },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useGuide();
  const isDark = resolvedTheme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      title={isDark ? "Зробити світліше" : "Зробити темніше"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="tap-highlight inline-flex h-11 w-11 items-center justify-center rounded-card border border-ink-200 bg-white text-ink-700 shadow-sm transition hover:border-ionian-500 dark:border-white/10 dark:bg-ink-900 dark:text-ink-50"
    >
      <Icon aria-hidden="true" size={19} />
      <span className="sr-only">Перемкнути тему</span>
    </button>
  );
}

function Header() {
  const { storageError } = useGuide();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-ink-50 dark:border-white/10 dark:bg-ink-900">
      <div className="mx-auto flex min-h-[68px] w-full max-w-6xl items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lava-600 dark:text-citrus-400">
            14–22 червня 2026
          </p>
          <h1 className="truncate text-lg font-bold text-ink-900 dark:text-white">Катанія, поїхали!</h1>
        </div>
        <NavLink
          to="/memories"
          title="Що вже відмітив"
          className="tap-highlight inline-flex h-11 w-11 items-center justify-center rounded-card border border-ink-200 bg-white text-ink-700 shadow-sm transition hover:border-lava-500 dark:border-white/10 dark:bg-ink-900 dark:text-ink-50"
        >
          <Heart aria-hidden="true" size={19} />
          <span className="sr-only">Мій список</span>
        </NavLink>
        <ThemeToggle />
      </div>
      {storageError ? (
        <div className="border-t border-citrus-400/40 bg-citrus-100 px-4 py-2 text-sm font-medium text-ink-900">
          {storageError}
        </div>
      ) : null}
    </header>
  );
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_34px_rgba(16,23,34,0.10)] dark:border-white/10 dark:bg-ink-900 md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 px-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              [
                "tap-highlight flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-card px-1 text-[11px] font-semibold transition",
                isActive
                  ? "text-lava-600 dark:text-citrus-400"
                  : "text-ink-500 hover:text-ink-900 dark:text-ink-200 dark:hover:text-white",
              ].join(" ")
            }
          >
            <Icon aria-hidden="true" size={21} />
            <span className="max-w-full truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function DesktopNav() {
  return (
    <aside className="sticky top-[92px] hidden h-[calc(100vh-116px)] w-52 shrink-0 md:block">
      <nav className="space-y-2 rounded-card border border-ink-200 bg-white p-2 shadow-soft dark:border-white/10 dark:bg-ink-900">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              [
                "tap-highlight flex min-h-11 items-center gap-3 rounded-card px-3 text-sm font-semibold transition",
                isActive
                  ? "bg-lava-50 text-lava-700 dark:bg-lava-500/15 dark:text-citrus-400"
                  : "text-ink-600 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-white/6",
              ].join(" ")
            }
          >
            <Icon aria-hidden="true" size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 dark:bg-ink-900 dark:text-ink-50">
      <Header />
      <div className="mx-auto flex w-full max-w-6xl gap-5 px-4 pb-28 pt-4 md:pb-8 md:pt-6">
        <DesktopNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
