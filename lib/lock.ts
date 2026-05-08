// Server-only run-guard for the ingestion pipeline.
//
// Strategy: a single row in `pipeline_locks` per logical job key. Acquisition
// is an INSERT with ON CONFLICT DO NOTHING after a best-effort cleanup of
// stale rows. This gives us:
//   - mutual exclusion across overlapping cron invocations
//   - automatic recovery if a pipeline run crashes (stale row evicted on next
//     attempt because expires_at < now())
//   - no advisory-lock connection pinning (HTTP-driver-safe)

import { randomUUID } from "node:crypto";
import type { Sql } from "./db";

export interface AcquiredLock {
  key: string;
  holder: string;
  expiresAt: string;
}

interface LockRow {
  key: string;
  holder: string;
  expires_at: string | Date;
}

export async function acquireLock(
  sql: Sql,
  key: string,
  ttlMs: number,
): Promise<AcquiredLock | null> {
  const holder = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs).toISOString();

  // Best-effort cleanup of stale locks first.
  await sql`DELETE FROM pipeline_locks WHERE key = ${key} AND expires_at < now()`;

  const rows = (await sql`
    INSERT INTO pipeline_locks (key, holder, acquired_at, expires_at)
    VALUES (${key}, ${holder}, ${now.toISOString()}, ${expiresAt})
    ON CONFLICT (key) DO NOTHING
    RETURNING key, holder, expires_at
  `) as LockRow[];

  const r = rows[0];
  if (!r || r.holder !== holder) return null;
  return {
    key: r.key,
    holder: r.holder,
    expiresAt: r.expires_at instanceof Date ? r.expires_at.toISOString() : r.expires_at,
  };
}

export async function releaseLock(sql: Sql, lock: AcquiredLock): Promise<void> {
  await sql`DELETE FROM pipeline_locks WHERE key = ${lock.key} AND holder = ${lock.holder}`;
}
