// Neon Postgres access layer.
//
// Uses `@neondatabase/serverless`'s tagged-template HTTP driver — single
// roundtrip per query, no pool pinning, edge-compatible. We don't use a Pool
// here because the pipeline does not require multi-statement transactions.
//
// `DATABASE_URL` is the only env var needed; absent → returns null and the
// app falls back to the built-in demo snapshot.

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export type Sql = NeonQueryFunction<false, false>;

let _sql: Sql | null = null;

export function getSql(): Sql | null {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  _sql = neon(url) as Sql;
  return _sql;
}

export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

// Coerce values that Postgres returns as Date objects back to ISO strings —
// the rest of the app passes timestamps as strings throughout.
export function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date(String(value)).toISOString();
}
