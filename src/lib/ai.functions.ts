import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { AiError, GROUNDING_RULES, callAiJson } from "./ai.server";

/* ---------------------------------- types --------------------------------- */

export type EmailResult = {
  subject: string;
  body: string;
  missingInfo: string[];
};

export type MeetingResult = {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: { task: string; owner: string; deadline: string }[];
  missingInfo: string[];
};

export type PlanResult = {
  horizon: string;
  schedule: {
    day: string;
    blocks: { start: string; end: string; task: string; priority: string; why: string }[];
  }[];
  optimizations: string[];
  missingInfo: string[];
};

const NOT_SPECIFIED = "Not specified";

function toError(e: unknown): never {
  if (e instanceof AiError) throw new Error(e.message);
  throw new Error(e instanceof Error ? e.message : "Something went wrong. Please retry.");
}

/* ------------------------------ email generator ---------------------------- */

const EmailInput = z.object({
  context: z.string().trim().min(20, "Add at least 20 characters of context."),
  tone: z.enum(["Formal", "Informal", "Persuasive"]),
  audience: z.enum(["Client", "Manager", "Team"]),
  seed: z.number().optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const system = `You are a workplace email writing assistant. ${GROUNDING_RULES}
Write a single email in a ${data.tone.toLowerCase()} tone addressed to a ${data.audience.toLowerCase()}.
Keep it under 180 words, with a clear ask and a professional sign-off placeholder "[Your name]".
JSON schema: {"subject": string, "body": string, "missingInfo": string[]}`;

    try {
      const { data: result } = await callAiJson<EmailResult>({
        system,
        user: `Context provided by the user:\n"""${data.context}"""\nVariation hint: ${data.seed ?? 0}`,
        fallback: () => mockEmail(data.context, data.tone, data.audience),
      });
      return {
        subject: result.subject ?? "",
        body: result.body ?? "",
        missingInfo: Array.isArray(result.missingInfo) ? result.missingInfo : [],
      } satisfies EmailResult;
    } catch (e) {
      toError(e);
    }
  });

function mockEmail(context: string, tone: string, audience: string): EmailResult {
  const opener =
    tone === "Formal"
      ? "I hope this message finds you well."
      : tone === "Informal"
        ? "Hope you're doing well!"
        : "I wanted to share something I think is worth your time.";
  const first = context.trim().split(/(?<=[.!?])\s+/)[0] ?? context.trim();
  return {
    subject: first.slice(0, 60).replace(/[.!?]$/, ""),
    body: `Hi [${audience} name],\n\n${opener}\n\n${context.trim()}\n\nPlease let me know if you have any questions or would like me to follow up with more detail.\n\nBest regards,\n[Your name]`,
    missingInfo: [
      "Recipient name",
      "Any dates or deadlines you want stated explicitly",
    ],
  };
}

/* --------------------------- meeting notes summary ------------------------- */

const MeetingInput = z.object({
  notes: z.string().trim().min(40, "Paste at least 40 characters of meeting notes."),
  seed: z.number().optional(),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MeetingInput.parse(input))
  .handler(async ({ data }) => {
    const system = `You summarise workplace meeting notes. ${GROUNDING_RULES}
Owners and deadlines must be copied verbatim from the notes; if absent use "${NOT_SPECIFIED}".
JSON schema: {"summary": string, "keyPoints": string[], "decisions": string[], "actionItems": [{"task": string, "owner": string, "deadline": string}], "missingInfo": string[]}`;

    try {
      const { data: r } = await callAiJson<MeetingResult>({
        system,
        user: `Meeting notes:\n"""${data.notes}"""\nVariation hint: ${data.seed ?? 0}`,
        fallback: () => mockMeeting(data.notes),
      });
      return {
        summary: r.summary ?? "",
        keyPoints: r.keyPoints ?? [],
        decisions: r.decisions ?? [],
        actionItems: (r.actionItems ?? []).map((a) => ({
          task: a?.task ?? "",
          owner: a?.owner || NOT_SPECIFIED,
          deadline: a?.deadline || NOT_SPECIFIED,
        })),
        missingInfo: r.missingInfo ?? [],
      } satisfies MeetingResult;
    } catch (e) {
      toError(e);
    }
  });

function mockMeeting(notes: string): MeetingResult {
  const lines = notes
    .split(/\n|(?<=[.!?])\s+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const isAction = (l: string) => /\b(will|action|todo|to do|follow up|assign|send|prepare)\b/i.test(l);
  const isDecision = (l: string) => /\b(decided|agreed|approved|chose|confirmed)\b/i.test(l);
  return {
    summary: lines.slice(0, 2).join(" ") || notes.slice(0, 180),
    keyPoints: lines.filter((l) => !isAction(l) && !isDecision(l)).slice(0, 5),
    decisions: lines.filter(isDecision).slice(0, 5),
    actionItems: lines.filter(isAction).slice(0, 5).map((task) => ({
      task,
      owner: NOT_SPECIFIED,
      deadline: NOT_SPECIFIED,
    })),
    missingInfo: ["Owners and deadlines were not clearly stated in the notes."],
  };
}

/* ------------------------------- task planner ------------------------------ */

const PlanInput = z.object({
  tasks: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        deadline: z.string().trim(),
        priority: z.enum(["High", "Medium", "Low"]),
        estimateHours: z.number().min(0.25).max(40),
      }),
    )
    .min(1, "Add at least one task."),
  hoursPerDay: z.number().min(1).max(16),
  horizon: z.enum(["Daily", "Weekly"]),
  seed: z.number().optional(),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => {
    const system = `You are a work scheduling assistant. ${GROUNDING_RULES}
Build a ${data.horizon.toLowerCase()} schedule using only the listed tasks, respecting ${data.hoursPerDay} available working hours per day.
Order by urgency (deadline) and importance (priority). Start the working day at 09:00 and include a short break where sensible.
JSON schema: {"horizon": string, "schedule": [{"day": string, "blocks": [{"start": "HH:MM", "end": "HH:MM", "task": string, "priority": string, "why": string}]}], "optimizations": string[], "missingInfo": string[]}`;

    try {
      const { data: r } = await callAiJson<PlanResult>({
        system,
        user: `Available hours per day: ${data.hoursPerDay}\nHorizon: ${data.horizon}\nTasks:\n${data.tasks
          .map(
            (t) =>
              `- ${t.title} | deadline: ${t.deadline || NOT_SPECIFIED} | priority: ${t.priority} | estimate: ${t.estimateHours}h`,
          )
          .join("\n")}\nVariation hint: ${data.seed ?? 0}`,
        fallback: () => mockPlan(data),
      });
      return {
        horizon: r.horizon || data.horizon,
        schedule: r.schedule ?? [],
        optimizations: r.optimizations ?? [],
        missingInfo: r.missingInfo ?? [],
      } satisfies PlanResult;
    } catch (e) {
      toError(e);
    }
  });

function mockPlan(data: z.infer<typeof PlanInput>): PlanResult {
  const rank = { High: 0, Medium: 1, Low: 2 } as const;
  const sorted = [...data.tasks].sort(
    (a, b) =>
      (a.deadline || "9999").localeCompare(b.deadline || "9999") ||
      rank[a.priority] - rank[b.priority],
  );
  const dayNames = data.horizon === "Daily" ? ["Today"] : ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const schedule: PlanResult["schedule"] = [];
  let dayIndex = 0;
  let cursor = 9 * 60;
  let used = 0;
  const fmt = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

  for (const t of sorted) {
    if (used + t.estimateHours > data.hoursPerDay && dayIndex < dayNames.length - 1) {
      dayIndex += 1;
      cursor = 9 * 60;
      used = 0;
    }
    const day = dayNames[Math.min(dayIndex, dayNames.length - 1)] ?? "Today";
    let bucket = schedule.find((s) => s.day === day);
    if (!bucket) {
      bucket = { day, blocks: [] };
      schedule.push(bucket);
    }
    const end = cursor + t.estimateHours * 60;
    bucket.blocks.push({
      start: fmt(cursor),
      end: fmt(end),
      task: t.title,
      priority: t.priority,
      why: `${t.priority} priority${t.deadline ? `, due ${t.deadline}` : ""}`,
    });
    cursor = end + 15;
    used += t.estimateHours;
  }

  return {
    horizon: data.horizon,
    schedule,
    optimizations: [
      "Tackle the highest-priority task in your first focus block of the day.",
      "Group short tasks together to reduce context switching.",
      "Leave the last 30 minutes of each day for overflow and follow-ups.",
    ],
    missingInfo: data.tasks.some((t) => !t.deadline)
      ? ["Some tasks have no deadline, so they were ordered by priority only."]
      : [],
  };
}
