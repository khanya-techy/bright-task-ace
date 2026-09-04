import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import {
  Disclaimer,
  ErrorState,
  FieldLabel,
  LoadingLines,
  MissingInfo,
  OutputActions,
  Panel,
  PrimaryButton,
  TextArea,
  ValidationError,
} from "@/components/tool-ui";
import { summarizeMeeting, type MeetingResult } from "@/lib/ai.functions";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Velaro" },
      {
        name: "description",
        content:
          "Turn long meeting notes into a concise summary with key points, decisions, action items, owners and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Velaro" },
      {
        property: "og:description",
        content:
          "Turn long meeting notes into key points, decisions, action items, owners and deadlines.",
      },
    ],
  }),
  component: MeetingsPage,
});

const EMPTY: MeetingResult = {
  summary: "",
  keyPoints: [],
  decisions: [],
  actionItems: [],
  missingInfo: [],
};

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [invalid, setInvalid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MeetingResult | null>(null);

  async function generate() {
    if (notes.trim().length < 40) {
      setInvalid("Paste at least 40 characters of meeting notes.");
      return;
    }
    setInvalid(null);
    setError(null);
    setLoading(true);
    try {
      const r = (await run({
        data: { notes, seed: Math.floor(Math.random() * 1000) },
      })) as MeetingResult;
      setResult(r);
      addHistory({
        kind: "meeting",
        title: r.summary.slice(0, 60) || "Meeting summary",
        preview: r.summary.slice(0, 140),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Summarization failed. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  function patch(p: Partial<MeetingResult>) {
    setResult((r) => ({ ...(r ?? EMPTY), ...p }));
  }

  function asText(r: MeetingResult) {
    return [
      `Summary\n${r.summary}`,
      `Key points\n${r.keyPoints.map((k) => `- ${k}`).join("\n")}`,
      `Decisions\n${r.decisions.map((k) => `- ${k}`).join("\n")}`,
      `Action items\n${r.actionItems
        .map((a) => `- ${a.task} (owner: ${a.owner}, deadline: ${a.deadline})`)
        .join("\n")}`,
    ].join("\n\n");
  }

  return (
    <AppShell
      kicker="(c) meeting summarizer"
      title="Meeting Notes Summarizer"
      description="Paste raw notes. Owners and deadlines are only reported when the notes state them."
    >
      <Panel label="input">
        <div>
          <FieldLabel>Meeting notes</FieldLabel>
          <TextArea
            rows={8}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste the full meeting notes or transcript here…"
            aria-label="Meeting notes"
          />
          <div className="mt-1 flex items-center justify-between">
            <ValidationError message={invalid} />
            <span className="font-mono text-[10px] text-muted-foreground">
              {notes.trim().length} chars
            </span>
          </div>
        </div>
        <PrimaryButton onClick={generate} loading={loading}>
          {loading ? "Summarizing…" : "Summarize notes"}
        </PrimaryButton>
        {error ? <ErrorState message={error} onRetry={generate} /> : null}
      </Panel>

      {(loading || result) && (
        <Panel
          label="output · editable"
          badge={
            <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
              {loading ? "generating" : "ready"}
            </span>
          }
        >
          {loading || !result ? (
            <LoadingLines rows={7} />
          ) : (
            <>
              <div>
                <FieldLabel>Summary</FieldLabel>
                <TextArea
                  rows={3}
                  value={result.summary}
                  onChange={(e) => patch({ summary: e.target.value })}
                />
              </div>

              <EditableList
                label="Key points"
                items={result.keyPoints}
                onChange={(keyPoints) => patch({ keyPoints })}
              />
              <EditableList
                label="Decisions"
                items={result.decisions}
                onChange={(decisions) => patch({ decisions })}
              />

              <div>
                <FieldLabel>Action items</FieldLabel>
                <div className="mt-1 space-y-2">
                  {result.actionItems.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground">
                      No action items were stated in the notes.
                    </p>
                  ) : (
                    result.actionItems.map((a, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-1 gap-1.5 rounded-lg border border-border/80 bg-surface/60 p-2 sm:grid-cols-[1fr_auto_auto]"
                      >
                        <input
                          value={a.task}
                          aria-label="Task"
                          onChange={(e) => {
                            const next = [...result.actionItems];
                            next[i] = { ...a, task: e.target.value };
                            patch({ actionItems: next });
                          }}
                          className="rounded-md bg-transparent px-1.5 py-1 text-[12px] focus:ring-2 focus:ring-ring/40 focus:outline-none"
                        />
                        <input
                          value={a.owner}
                          aria-label="Owner"
                          onChange={(e) => {
                            const next = [...result.actionItems];
                            next[i] = { ...a, owner: e.target.value };
                            patch({ actionItems: next });
                          }}
                          className="rounded-md bg-transparent px-1.5 py-1 font-mono text-[11px] text-muted-foreground focus:ring-2 focus:ring-ring/40 focus:outline-none sm:w-32"
                        />
                        <input
                          value={a.deadline}
                          aria-label="Deadline"
                          onChange={(e) => {
                            const next = [...result.actionItems];
                            next[i] = { ...a, deadline: e.target.value };
                            patch({ actionItems: next });
                          }}
                          className="rounded-md bg-transparent px-1.5 py-1 font-mono text-[11px] text-muted-foreground focus:ring-2 focus:ring-ring/40 focus:outline-none sm:w-32"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <MissingInfo items={result.missingInfo} />
              <OutputActions
                onCopy={() => asText(result)}
                onRegenerate={generate}
                onClear={() => {
                  setResult(null);
                  setError(null);
                }}
              />
            </>
          )}
        </Panel>
      )}

      <Disclaimer />
    </AppShell>
  );
}

function EditableList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-1 space-y-1.5">
        {items.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">
            None stated in the notes.
          </p>
        ) : (
          items.map((item, i) => (
            <input
              key={i}
              value={item}
              aria-label={`${label} ${i + 1}`}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="w-full rounded-lg border border-border/80 bg-surface/60 px-2.5 py-1.5 text-[12px] focus:ring-2 focus:ring-ring/40 focus:outline-none"
            />
          ))
        )}
      </div>
    </div>
  );
}
