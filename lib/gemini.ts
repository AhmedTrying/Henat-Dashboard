// Server-only. Never import this from a client component.

const FALLBACK_MODEL = "gemini-2.5-flash";
const DEFAULT_MODEL = process.env.GEMINI_MODEL || FALLBACK_MODEL;

export interface ExtractedCountry {
  country: string;
  country_code: string;
  confirmed_cases: number;
  suspected_cases: number;
  deaths: number;
  active_events: number;
  report_date: string;
  source_url: string;
}

export interface ExtractedEvent {
  name: string;
  location: string;
  country: string;
  country_code: string;
  confirmed_cases: number;
  suspected_cases: number;
  deaths: number;
  status: "active" | "monitoring" | "contained";
  report_date: string;
  source_url: string;
}

export interface ExtractionResult {
  countries: ExtractedCountry[];
  events: ExtractedEvent[];
  confidence: number;
  notes?: string;
}

export const PROMPT_VERSION = "v1.0";

const SYSTEM_INSTRUCTIONS = `You are an extraction assistant for public-health reporting.

You receive raw text from official health-authority pages (WHO, CDC, ECDC, PAHO, national health ministries) about Hantavirus.

Your job is to extract ONLY what the source explicitly reports. Do not invent or infer numbers. Do not fall back to news media. Do not hallucinate.

Return strict JSON matching this TypeScript shape:

{
  "countries": Array<{
    "country": string,
    "country_code": string,         // ISO 3166-1 alpha-2 uppercase
    "confirmed_cases": number,      // lab-confirmed cases ONLY
    "suspected_cases": number,      // suspected/probable, NOT confirmed
    "deaths": number,
    "active_events": number,        // distinct active outbreak events in this country
    "report_date": string,          // YYYY-MM-DD as published by source
    "source_url": string
  }>,
  "events": Array<{
    "name": string,
    "location": string,
    "country": string,
    "country_code": string,
    "confirmed_cases": number,
    "suspected_cases": number,
    "deaths": number,
    "status": "active" | "monitoring" | "contained",
    "report_date": string,
    "source_url": string
  }>,
  "confidence": number,             // 0..1, how confidently you extracted these fields
  "notes": string                   // free-text caveats; mention if data is provisional
}

Rules:
- Numbers must be non-negative integers.
- Confirmed and suspected MUST be reported separately. Never combine.
- If a field is unclear or missing, omit the record OR set confidence below 0.7.
- Output ONLY valid JSON. No markdown fences, no commentary.`;

export interface CallGeminiInput {
  sourceUrl: string;
  sourceCode: string;
  rawText: string;
}

export async function callGeminiExtract(
  input: CallGeminiInput,
): Promise<{ result: ExtractionResult; rawResponse: string; modelUsed: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }
  const userPrompt = `Source code: ${input.sourceCode}\nSource URL: ${input.sourceUrl}\n\nRaw text:\n${input.rawText.slice(0, 30_000)}`;

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTIONS }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
    },
  };

  const modelsToTry = uniqueModels([DEFAULT_MODEL, FALLBACK_MODEL]);
  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      const text = await requestModel({ apiKey, model, body });
      let parsed: ExtractionResult;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("Gemini response was not valid JSON");
      }
      return { result: normalize(parsed), rawResponse: text, modelUsed: model };
    } catch (err) {
      lastError = err;
      if (err instanceof GeminiHttpError && err.status === 429) {
        continue;
      }
      throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Gemini request failed");
}

async function requestModel({
  apiKey,
  model,
  body,
}: {
  apiKey: string;
  model: string;
  body: Record<string, unknown>;
}): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await safeErrorText(res);
    throw new GeminiHttpError(
      res.status,
      errText ? `Gemini request failed with status ${res.status}: ${errText}` : `Gemini request failed with status ${res.status}`,
    );
  }

  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) {
    throw new Error("Gemini response had no text");
  }
  return text;
}

function normalize(r: Partial<ExtractionResult>): ExtractionResult {
  return {
    countries: (r.countries ?? []).map((c) => ({
      country: String(c.country ?? ""),
      country_code: String(c.country_code ?? "").toUpperCase().slice(0, 2),
      confirmed_cases: nonNegInt(c.confirmed_cases),
      suspected_cases: nonNegInt(c.suspected_cases),
      deaths: nonNegInt(c.deaths),
      active_events: nonNegInt(c.active_events),
      report_date: String(c.report_date ?? "").slice(0, 10),
      source_url: String(c.source_url ?? ""),
    })),
    events: (r.events ?? []).map((e) => ({
      name: String(e.name ?? ""),
      location: String(e.location ?? ""),
      country: String(e.country ?? ""),
      country_code: String(e.country_code ?? "").toUpperCase().slice(0, 2),
      confirmed_cases: nonNegInt(e.confirmed_cases),
      suspected_cases: nonNegInt(e.suspected_cases),
      deaths: nonNegInt(e.deaths),
      status: (["active", "monitoring", "contained"] as const).includes(
        e.status as "active" | "monitoring" | "contained",
      )
        ? (e.status as "active" | "monitoring" | "contained")
        : "monitoring",
      report_date: String(e.report_date ?? "").slice(0, 10),
      source_url: String(e.source_url ?? ""),
    })),
    confidence: clamp01(typeof r.confidence === "number" ? r.confidence : 0),
    notes: r.notes ? String(r.notes) : undefined,
  };
}

function nonNegInt(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function uniqueModels(models: string[]): string[] {
  return Array.from(new Set(models.filter(Boolean)));
}

async function safeErrorText(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: { message?: string } };
    return data.error?.message?.slice(0, 300) ?? "";
  } catch {
    return "";
  }
}

class GeminiHttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
