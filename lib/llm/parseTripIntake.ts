import { z } from "zod";

const parseSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
  cargoWeightKg: z.number().positive(),
  plannedDistanceKm: z.number().positive(),
  confidence: z.number().min(0).max(1),
});

export type IntakeResult =
  | { ok: true; confidence: number; data: Omit<z.infer<typeof parseSchema>, "confidence"> }
  | { ok: false; reason: string; fallbackToManual: true };

export async function parseTripIntake(input: string, timeoutMs = 3500): Promise<IntakeResult> {
  if (!process.env.CLAUDE_API_KEY) return { ok: false, reason: "AI unavailable. Use manual form.", fallbackToManual: true };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 300,
        system: "Return strict JSON with source,destination,cargoWeightKg,plannedDistanceKm,confidence between 0 and 1.",
        messages: [{ role: "user", content: [{ type: "text", text: input }] }],
      }),
    });

    if (!response.ok) return { ok: false, reason: "AI parse failed. Use manual entry.", fallbackToManual: true };
    const data = await response.json();
    const rawText: string = data?.content?.[0]?.text ?? "";
    const parsedJson = JSON.parse(rawText);
    const parsed = parseSchema.safeParse(parsedJson);

    if (!parsed.success || parsed.data.confidence < 0.7) {
      return { ok: false, reason: "Low-confidence parse. Please confirm manually.", fallbackToManual: true };
    }

    return {
      ok: true,
      confidence: parsed.data.confidence,
      data: {
        source: parsed.data.source,
        destination: parsed.data.destination,
        cargoWeightKg: parsed.data.cargoWeightKg,
        plannedDistanceKm: parsed.data.plannedDistanceKm,
      },
    };
  } catch {
    return { ok: false, reason: "AI timeout/failure. Switched to manual mode.", fallbackToManual: true };
  } finally {
    clearTimeout(timeout);
  }
}
