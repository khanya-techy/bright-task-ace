import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  NotebookPen,
  CalendarClock,
  History,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

type NavItem = { to: string; label: string; short: string; icon: LucideIcon };

export const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", short: "Email", icon: Mail },
  { to: "/meetings", label: "Meeting Summarizer", short: "Meetings", icon: NotebookPen },
  { to: "/planner", label: "Task Planner", short: "Planner", icon: CalendarClock },
  { to: "/history", label: "History", short: "History", icon: History },
  { to: "/settings", label: "Settings", short: "Settings", icon: Settings },
];

export function AppShell({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -left-20 size-64 rounded-full bg-accent/20 blur-3xl"
      />

      <div className="relative z-10 lg:flex">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <TopBar />
          <main className="px-4 pt-4 pb-24 sm:px-6 lg:px-8 lg:pb-10">
            <div className="mx-auto w-full max-w-5xl">
              <header className="rise">
                <p className="font-mono text-[11px] text-muted-foreground">{kicker}</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-1 text-sm text-pretty text-muted-foreground">{description}</p>
                ) : null}
              </header>
              <div className="mt-5 space-y-5">{children}</div>
            </div>
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="glass sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border/70 lg:block">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground ring-1 ring-black/5">
          V
        </div>
        <div>
          <p className="text-sm leading-none font-semibold">Velaro</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">workplace assistant</p>
        </div>
      </div>
      <nav className="space-y-1 px-2">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            activeProps={{ className: "bg-primary/10 text-primary hover:bg-primary/10" }}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
      <p className="mt-6 px-4 font-mono text-[10px] leading-relaxed text-muted-foreground">
        AI output may contain errors. Review before professional use.
      </p>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="glass sticky top-0 z-20 border-b border-border/70">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground ring-1 ring-black/5">
            V
          </div>
          <div>
            <p className="text-sm leading-none font-semibold">Velaro</p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">workplace assistant</p>
          </div>
        </div>
        <p className="hidden font-mono text-[11px] text-muted-foreground lg:block">
          AI Workplace Productivity Assistant
        </p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">Signed in</span>
          <div className="grid size-8 place-items-center rounded-full bg-foreground/90 text-[11px] font-semibold text-background ring-1 ring-black/5">
            DM
          </div>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-border/70 lg:hidden">
      {NAV.map(({ to, short, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: to === "/" }}
          className="flex flex-col items-center gap-1 py-2.5 text-muted-foreground"
          activeProps={{ className: "text-primary" }}
        >
          <Icon className="size-4" aria-hidden />
          <span className="text-[9px] font-medium">{short}</span>
        </Link>
      ))}
    </nav>
  );
}
