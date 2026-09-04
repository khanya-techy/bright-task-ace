import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Disclaimer, FieldLabel, Panel, TextInput } from "@/components/tool-ui";
import { clearHistory } from "@/lib/history";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Velaro" },
      {
        name: "description",
        content:
          "Set your display name, default email tone and audience, and review the responsible AI policy for Velaro.",
      },
      { property: "og:title", content: "Settings — Velaro" },
      {
        property: "og:description",
        content: "Set your defaults and review the responsible AI policy for Velaro.",
      },
    ],
  }),
  component: SettingsPage,
});

const KEY = "velaro.settings.v1";

function SettingsPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw) as { name?: string; role?: string };
        setName(s.name ?? "");
        setRole(s.role ?? "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  function save() {
    window.localStorage.setItem(KEY, JSON.stringify({ name, role }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <AppShell
      kicker="(e) settings"
      title="Settings"
      description="Preferences are stored in this browser only."
    >
      <Panel label="profile">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel>Display name</FieldLabel>
            <div className="mt-1">
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dana Mokoena"
              />
            </div>
          </div>
          <div>
            <FieldLabel>Role / team</FieldLabel>
            <div className="mt-1">
              <TextInput
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Product Operations"
              />
            </div>
          </div>
        </div>
        <button
          onClick={save}
          className="rounded-lg bg-primary px-3 py-2 text-[13px] font-semibold text-primary-foreground ring-1 ring-black/5 hover:bg-primary/90"
        >
          {saved ? "Saved" : "Save preferences"}
        </button>
      </Panel>

      <Panel label="data">
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Generated items are kept in this browser's local storage so you can review recent
          activity. Clearing removes them permanently.
        </p>
        <button
          onClick={clearHistory}
          className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2 text-[12px] font-medium text-destructive hover:bg-destructive/15"
        >
          Clear all history
        </button>
      </Panel>

      <Panel label="responsible ai">
        <ul className="space-y-1.5 text-[12px] leading-relaxed text-muted-foreground">
          <li>— Outputs are drafts. Review and edit before sending or sharing professionally.</li>
          <li>— The assistant works only from the context you provide and flags missing details.</li>
          <li>— Do not enter confidential, personal or commercially sensitive information.</li>
          <li>— AI can make mistakes, including in names, dates and figures.</li>
        </ul>
      </Panel>

      <Disclaimer />
    </AppShell>
  );
}
