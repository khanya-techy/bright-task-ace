const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

export class AiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls Lovable AI and returns parsed JSON matching the requested shape.
 * Prompts are structured and grounded: the model may only use user-supplied facts.
 */
export async function callAiJson<T>(args: {
  system: string;
  user: string;
  fallback: () => T;
}): Promise<{ data: T; source: "ai" | "mock" }> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return { data: args.fallback(), source: "mock" };

  let res: Response;
  try {
    res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: args.system },
          { role: "user", content: args.user },
        ],
        response_format: { type: "json_object" },
      }),
    });
  } catch {
    return { data: args.fallback(), source: "mock" };
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 429)
      throw new AiError("Too many requests right now. Please wait a moment and retry.", 429);
    if (res.status === 402)
      throw new AiError(
        "AI credits are exhausted for this workspace. Add credits in Lovable to continue.",
        402,
      );
    if (res.status === 403)
      throw new AiError("AI access is blocked by workspace policy.", 403);
    if (res.status >= 500)
      throw new AiError("The AI service is temporarily unavailable. Please retry.", res.status);
    throw new AiError(body?.slice(0, 300) || "The AI request was rejected.", res.status);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content ?? "";
  try {
    const cleaned = content.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "");
    return { data: JSON.parse(cleaned) as T, source: "ai" };
  } catch {
    return { data: args.fallback(), source: "mock" };
  }
}

export const GROUNDING_RULES = [
  "Use ONLY facts present in the user's input.",
  "Never invent names, dates, deadlines, owners, decisions, numbers or commitments.",
  "If required information is missing, list it under missingInfo instead of guessing.",
  "Be concise, professional and free of filler.",
  "Respond with valid JSON only, matching the requested schema exactly.",
].join(" ");
