// Run one ingestion cycle locally.
//
// Usage:
//   npm run ingest:once
//
// Requires DATABASE_URL and GEMINI_API_KEY in .env.local.
// Without those, the pipeline returns a demo-fallback result.

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { runIngestion } from "../lib/pipeline";

async function main() {
  const result = await runIngestion();
  // Don't print env vars / secrets. The result object is safe.
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
