import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Disclaimer } from "@/components/tool-ui";
import {
  KIND_LABEL,
  readHistory,
  subscribeHistory,
  timeAgo,
  type HistoryEntry,
} from "@/lib/history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Velaro — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Draft emails, summarize meeting notes and plan your week with an AI workplace assistant built for professionals.",
      },
      { property: "og:title", content: "Velaro — AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Draft emails, summarize meeting notes and plan your week with an AI workplace assistant built for professionals.",
      },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  {
    n: "01",
    to: "/email" as const,
    title: "Email Generator",
    blurb: "Draft faster",
    tint: "bg-primary/10 text-primary",
  },
  {
    n: "02",
    to: "/meetings" as const,
    title: "Meeting Summarizer",
    blurb: "Notes to key points",
    tint: "bg-accent/10 text-accent",
  },
  {
    n: "03",
    to: "/planner" as const,
    title: "Task Planner",
    blurb: "Prioritize your day",
    tint: "bg-foreground/10 text-foreground",
  },
];

function Dashboard() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    const sync = () => setEntries(readHistory().slice(0, 5));
    sync();
    return subscribeHistory(sync);
  }, []);

  return (
    <AppShell
      kicker="(a) dashboard"
      title="Your workplace assistant"
      description="Three tools ready. Everything runs on the context you provide — nothing is invented."
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {TOOLS.map((t, i) => (
          <Link
            key={t.to}
            to={t.to}
            className="rise glass rounded-xl border border-border/70 p-3 text-left transition-transform hover:-translate-y-0.5"
            style={{ animationDelay: `${40 + i * 40}ms` }}
          >
            <span
              className={`grid size-8 place-items-center rounded-lg font-mono text-xs font-semibold ${t.tint}`}
            >
              {t.n}
            </span>
            <p className="mt-2 text-[13px] leading-tight font-semibold">{t.title}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{t.blurb}</p>
          </Link>
        ))}
      </div>

      <section className="rise" style={{ animationDelay: "160ms" }}>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[11px] text-muted-foreground">(b) recent activity</p>
          <Link to="/history" className="font-mono text-[11px] text-primary">
            View all
          </Link>
        </div>
        <div className="glass divide-y divide-border/70 rounded-xl border border-border/70">
          {entries.length === 0 ? (
            <p className="px-3 py-6 text-center text-[12px] text-muted-foreground">
              No activity yet. Generate an email, summary or plan to see it here.
            </p>
          ) : (
            entries.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-3 py-2.5">
                <span
                  className={`size-1.5 shrink-0 rounded-full ${
                    e.kind === "email"
                      ? "bg-primary"
                      : e.kind === "meeting"
                        ? "bg-accent"
                        : "bg-foreground/70"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{e.title}</p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    {KIND_LABEL[e.kind]} · {timeAgo(e.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Disclaimer />
    </AppShell>
  );
}
