import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Plus, X } from "lucide-react";
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
  TextInput,
  ValidationError,
} from "@/components/tool-ui";
import { planTasks, type PlanResult } from "@/lib/ai.functions";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Velaro" },
      {
        name: "description",
        content:
          "Turn tasks, deadlines, priorities and available hours into a prioritized daily or weekly schedule you can edit.",
      },
      { property: "og:title", content: "AI Task Planner — Velaro" },
      {
        property: "og:description",
        content: "Turn tasks, deadlines and available hours into a prioritized, editable schedule.",
      },
    ],
  }),
  component: PlannerPage,
});

const PRIORITIES = ["High", "Medium", "Low"] as const;
const HORIZONS = ["Daily", "Weekly"] as const;

type Task = {
  title: string;
  deadline: string;
  priority: (typeof PRIORITIES)[number];
  estimateHours: number;
};

const blankTask = (): Task => ({ title: "", deadline: "", priority: "Medium", estimateHours: 1 });

function PlannerPage() {
  const run = useServerFn(planTasks);
  const [tasks, setTasks] = useState<Task[]>([blankTask()]);
  const [hoursPerDay, setHoursPerDay] = useState(6);
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>("Daily");
  const [invalid, setInvalid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanResult | null>(null);

  function update(i: number, patch: Partial<Task>) {
    setTasks((t) => t.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }

  async function generate() {
    const valid = tasks.filter((t) => t.title.trim().length > 0);
    if (valid.length === 0) {
      setInvalid("Add at least one task with a title.");
      return;
    }
    if (hoursPerDay < 1 || hoursPerDay > 16) {
      setInvalid("Available hours must be between 1 and 16.");
      return;
    }
    setInvalid(null);
    setError(null);
    setLoading(true);
    try {
      const r = (await run({
        data: {
          tasks: valid.map((t) => ({
            title: t.title.trim(),
            deadline: t.deadline,
            priority: t.priority,
            estimateHours: Number(t.estimateHours) || 1,
          })),
          hoursPerDay: Number(hoursPerDay),
          horizon,
          seed: Math.floor(Math.random() * 1000),
        },
      })) as PlanResult;
      setPlan(r);
      addHistory({
        kind: "plan",
        title: `${horizon} plan · ${valid.length} task${valid.length > 1 ? "s" : ""}`,
        preview: r.optimizations[0] ?? "",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Planning failed. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  function asText(p: PlanResult) {
    return (
      `${p.horizon} plan\n\n` +
      p.schedule
        .map(
          (d) =>
            `${d.day}\n` +
            d.blocks.map((b) => `  ${b.start}–${b.end}  ${b.task} (${b.priority})`).join("\n"),
        )
        .join("\n\n") +
      `\n\nOptimizations\n${p.optimizations.map((o) => `- ${o}`).join("\n")}`
    );
  }

  return (
    <AppShell
      kicker="(c) task planner"
      title="AI Task Planner"
      description="Enter tasks, deadlines, priorities and your available hours to get a prioritized schedule."
    >
      <Panel label="input">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <FieldLabel>Plan horizon</FieldLabel>
            <Segmented name="Horizon" options={HORIZONS} value={horizon} onChange={setHorizon} />
          </div>
          <div>
            <FieldLabel>Available hours per day</FieldLabel>
            <div className="mt-1">
              <TextInput
                type="number"
                min={1}
                max={16}
                step={0.5}
                value={hoursPerDay}
                aria-label="Available hours per day"
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div>
          <FieldLabel>Tasks</FieldLabel>
          <div className="mt-1 space-y-2">
            {tasks.map((t, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-1.5 rounded-lg border border-border/80 bg-surface/60 p-2 sm:grid-cols-[1fr_130px_120px_80px_auto]"
              >
                <TextInput
                  value={t.title}
                  placeholder="Task name"
                  aria-label={`Task ${i + 1} title`}
                  onChange={(e) => update(i, { title: e.target.value })}
                />
                <TextInput
                  type="date"
                  value={t.deadline}
                  aria-label={`Task ${i + 1} deadline`}
                  onChange={(e) => update(i, { deadline: e.target.value })}
                />
                <select
                  value={t.priority}
                  aria-label={`Task ${i + 1} priority`}
                  onChange={(e) =>
                    update(i, { priority: e.target.value as (typeof PRIORITIES)[number] })
                  }
                  className="rounded-lg border border-border/80 bg-surface/70 px-2.5 py-2 text-[13px] focus:ring-2 focus:ring-ring/40 focus:outline-none"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <TextInput
                  type="number"
                  min={0.25}
                  step={0.25}
                  value={t.estimateHours}
                  aria-label={`Task ${i + 1} estimated hours`}
                  onChange={(e) => update(i, { estimateHours: Number(e.target.value) })}
                />
                <button
                  type="button"
                  aria-label={`Remove task ${i + 1}`}
                  onClick={() => setTasks((list) => list.filter((_, idx) => idx !== i))}
                  className="grid place-items-center rounded-lg border border-border/80 bg-surface px-2 text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setTasks((t) => [...t, blankTask()])}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-surface px-2.5 py-1.5 text-[11px] font-medium hover:bg-foreground/5"
          >
            <Plus className="size-3.5" aria-hidden />
            Add task
          </button>
          <div className="mt-1">
            <ValidationError message={invalid} />
          </div>
        </div>

        <PrimaryButton onClick={generate} loading={loading}>
          {loading ? "Building plan…" : "Generate plan"}
        </PrimaryButton>
        {error ? <ErrorState message={error} onRetry={generate} /> : null}
      </Panel>

      {(loading || plan) && (
        <Panel
          label="output · editable schedule"
          badge={
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
              {loading ? "generating" : "ready"}
            </span>
          }
        >
          {loading || !plan ? (
            <LoadingLines rows={8} />
          ) : (
            <>
              <div className="space-y-3">
                {plan.schedule.map((day, di) => (
                  <div key={di}>
                    <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                      {day.day}
                    </p>
                    <div className="mt-1 divide-y divide-border/70 rounded-lg border border-border/80 bg-surface/60">
                      {day.blocks.map((b, bi) => (
                        <div key={bi} className="flex items-start gap-3 px-2.5 py-2">
                          <span className="mt-0.5 w-24 shrink-0 font-mono text-[11px] text-muted-foreground">
                            {b.start}–{b.end}
                          </span>
                          <div className="min-w-0 flex-1">
                            <input
                              value={b.task}
                              aria-label="Scheduled task"
                              onChange={(e) => {
                                const next = structuredClone(plan);
                                next.schedule[di]!.blocks[bi]!.task = e.target.value;
                                setPlan(next);
                              }}
                              className="w-full rounded-md bg-transparent text-[12px] font-medium focus:ring-2 focus:ring-ring/40 focus:outline-none"
                            />
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{b.why}</p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] ${
                              b.priority === "High"
                                ? "bg-destructive/10 text-destructive"
                                : b.priority === "Low"
                                  ? "bg-foreground/10 text-muted-foreground"
                                  : "bg-accent/10 text-accent"
                            }`}
                          >
                            {b.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {plan.optimizations.length > 0 && (
                <div className="rounded-lg border border-border/80 bg-surface/60 px-3 py-2.5">
                  <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                    Time optimizations
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {plan.optimizations.map((o) => (
                      <li key={o} className="text-[12px] leading-relaxed">
                        — {o}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <MissingInfo items={plan.missingInfo} />
              <OutputActions
                onCopy={() => asText(plan)}
                onRegenerate={generate}
                onClear={() => {
                  setPlan(null);
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
