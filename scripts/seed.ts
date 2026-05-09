// Seed Neon Postgres with the demo snapshot so the dashboard renders against
// the database without running the ingestion pipeline.
//
// Usage:
//   npm run seed
//
// Requires DATABASE_URL in .env.local (or process env).

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { neon } from "@neondatabase/serverless";
import { DEMO_SNAPSHOT } from "../lib/demo-data";
import { TRUSTED_SOURCES } from "../lib/sources";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Missing DATABASE_URL.");
    process.exit(1);
  }
  const sql = neon(url);

  console.log("Seeding trusted_sources...");
  for (const s of TRUSTED_SOURCES) {
    await sql`
      INSERT INTO trusted_sources (code, name, tier, url, country_code, enabled)
      VALUES (${s.code}, ${s.name}, ${s.tier}, ${s.url}, ${s.country_code ?? null}, ${s.enabled})
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        tier = EXCLUDED.tier,
        url = EXCLUDED.url,
        country_code = EXCLUDED.country_code,
        enabled = EXCLUDED.enabled,
        updated_at = now()
    `;
  }

  console.log("Inserting demo snapshot...");
  const rows = (await sql`
    INSERT INTO snapshots (as_of, data_status, totals, by_country, events, sources_used, timeline, last_checked, notes)
    VALUES (
      ${DEMO_SNAPSHOT.as_of},
      ${DEMO_SNAPSHOT.data_status},
      ${JSON.stringify(DEMO_SNAPSHOT.totals)}::jsonb,
      ${JSON.stringify(DEMO_SNAPSHOT.by_country)}::jsonb,
      ${JSON.stringify(DEMO_SNAPSHOT.events)}::jsonb,
      ${JSON.stringify(DEMO_SNAPSHOT.sources_used)}::jsonb,
      ${JSON.stringify(DEMO_SNAPSHOT.timeline)}::jsonb,
      ${DEMO_SNAPSHOT.last_checked},
      ${"[DEMO] Seeded demo snapshot."}
    )
    RETURNING id
  `) as { id: string }[];

  console.log(`Seeded snapshot id=${rows[0]?.id ?? "(unknown)"}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
