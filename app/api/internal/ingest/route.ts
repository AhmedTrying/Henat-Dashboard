// Internal cron-triggered ingestion endpoint.
//
// Authorization header: `Bearer <secret>` — required.
//
// Secret resolution (first non-empty wins):
//   1. CRON_SECRET          — Vercel's standard cron variable. Cron jobs
//                              configured in vercel.json automatically receive
//                              `Authorization: Bearer $CRON_SECRET` when this
//                              env var is set.
//   2. INGEST_CRON_SECRET   — project-specific fallback for backward
//                              compatibility with earlier deploys.
//
// If neither is configured the endpoint returns 503 (refuses to run with no
// auth) rather than silently allowing unauthenticated calls.

import { runIngestion } from "@/lib/pipeline";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}

async function handle(req: Request): Promise<Response> {
  const expected = process.env.CRON_SECRET || process.env.INGEST_CRON_SECRET || "";
  if (!expected) {
    return Response.json(
      {
        error:
          "Cron secret is not configured. Set CRON_SECRET (preferred) or INGEST_CRON_SECRET on the server.",
      },
      { status: 503 },
    );
  }

  const auth = req.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!timingSafeEq(provided, expected)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await runIngestion();
    return Response.json(result, { status: result.ok ? 200 : 207 });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        error: "ingestion_failed",
        message: err instanceof Error ? err.message : "unknown error",
      },
      { status: 500 },
    );
  }
}

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
