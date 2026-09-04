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
  Segmented,
  TextArea,
  TextInput,
  ValidationError,
} from "@/components/tool-ui";
import { generateEmail, type EmailResult } from "@/lib/ai.functions";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Velaro" },
      {
        name: "description",
        content:
          "Generate professional emails from your own context, with tone and audience controls, then edit, copy or regenerate.",
      },
      { property: "og:title", content: "Smart Email Generator — Velaro" },
      {
        property: "og:description",
        content: "Generate professional emails from your own context with tone and audience controls.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Informal", "Persuasive"] as const;
const AUDIENCES = ["Client", "Manager", "Team"] as const;

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]>("Client");
  const [context, setContext] = useState("");
  const [invalid, setInvalid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [hasResult, setHasResult] = useState(false);

  async function generate() {
    if (context.trim().length < 20) {
      setInvalid("Add at least 20 characters describing what the email should say.");
      return;
    }
    setInvalid(null);
    setError(null);
    setLoading(true);
    try {
      const r = (await run({
        data: { context, tone, audience, seed: Math.floor(Math.random() * 1000) },
      })) as EmailResult;
      setSubject(r.subject);
      setBody(r.body);
      setMissing(r.missingInfo);
      setHasResult(true);
      addHistory({
        kind: "email",
        title: r.subject || "Email draft",
        preview: r.body.slice(0, 140),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setSubject("");
    setBody("");
    setMissing([]);
    setHasResult(false);
    setError(null);
  }

  return (
    <AppShell
      kicker="(c) email generator"
      title="Smart Email Generator"
      description="Describe the situation. The assistant writes only from what you provide."
    >
      <Panel label="input">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <FieldLabel>Tone</FieldLabel>
            <Segmented name="Tone" options={TONES} value={tone} onChange={setTone} />
          </div>
          <div>
            <FieldLabel>Audience</FieldLabel>
            <Segmented
              name="Audience"
              options={AUDIENCES}
              value={audience}
              onChange={setAudience}
            />
          </div>
        </div>
        <div>
          <FieldLabel>Context</FieldLabel>
          <TextArea
            rows={5}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. Following up on yesterday's call, confirm we're on track for the Acme launch and request final sign-off before Friday."
            aria-label="Email context"
          />
          <div className="mt-1 flex items-center justify-between">
            <ValidationError message={invalid} />
            <span className="font-mono text-[10px] text-muted-foreground">
              {context.trim().length} chars
            </span>
          </div>
        </div>
        <PrimaryButton onClick={generate} loading={loading}>
          {loading ? "Generating…" : "Generate email"}
        </PrimaryButton>
        {error ? <ErrorState message={error} onRetry={generate} /> : null}
      </Panel>

      {(loading || hasResult) && (
        <Panel
          label="output · editable"
          badge={
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
              {loading ? "generating" : "ready"}
            </span>
          }
        >
          {loading ? (
            <LoadingLines rows={6} />
          ) : (
            <>
              <div>
                <FieldLabel>Subject</FieldLabel>
                <div className="mt-1">
                  <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
              </div>
              <div>
                <FieldLabel>Body</FieldLabel>
                <TextArea rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
              </div>
              <MissingInfo items={missing} />
              <OutputActions
                onCopy={() => `Subject: ${subject}\n\n${body}`}
                onRegenerate={generate}
                onClear={clear}
              />
            </>
          )}
        </Panel>
      )}

      <Disclaimer />
    </AppShell>
  );
}
