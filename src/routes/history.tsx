import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Disclaimer, Panel } from "@/components/tool-ui";
import {
  KIND_LABEL,
  clearHistory,
  readHistory,
  subscribeHistory,
  timeAgo,
  type HistoryEntry,
} from "@/lib/history";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Activity History — Velaro" },
      {
        name: "description",
        content: "Review the emails, meeting summaries and task plans you generated in this browser.",
      },
      { property: "og:title", content: "Activity History — Velaro" },
      {
        property: "og:description",
        content: "Review the emails, summaries and plans you generated with Velaro.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    const sync = () => setEntries(readHistory());
    sync();
    return subscribeHistory(sync);
  }, []);

  return (
    <AppShell
      kicker="(d) history"
      title="Activity history"
      description="Stored locally in this browser only — nothing is sent anywhere else."
    >
      <Panel
        label="generated items"
        badge={
          entries.length > 0 ? (
            <button
              onClick={clearHistory}
              className="rounded-md border border-border/80 bg-surface px-2.5 py-1 text-[11px] font-medium hover:bg-foreground/5"
            >
              Clear history
            </button>
          ) : undefined
        }
      >
        {entries.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-muted-foreground">
            Nothing here yet. Your generated emails, summaries and plans will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-border/70">
            {entries.map((e) => (
              <li key={e.id} className="py-2.5">
                <div className="flex items-center gap-3">
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
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {KIND_LABEL[e.kind]} · {timeAgo(e.createdAt)}
                    </p>
                  </div>
                </div>
                {e.preview ? (
                  <p className="mt-1 pl-4.5 text-[12px] leading-relaxed text-muted-foreground">
                    {e.preview}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Disclaimer />
    </AppShell>
  );
}
