# Security

## Immediate action required: rotate the Gemini API key

The Gemini API key that was previously shared in this workspace must be considered **exposed**. Treat it as compromised even if it never appeared in a public commit.

Do this now:

1. Open Google AI Studio → API keys: https://aistudio.google.com/apikey
2. Find the previously-used key and **delete / revoke** it.
3. Create a **new** Gemini API key.
4. Place the new key only in:
   - Local `.env.local` (never commit)
   - Vercel project → Settings → Environment Variables → `GEMINI_API_KEY`
5. Verify no `.env*` file with real values is tracked in git (`git ls-files | grep .env`).

## Other secrets in this project

| Name | Where it goes | Notes |
|---|---|---|
| `GEMINI_API_KEY` | server-only | Used by ingestion pipeline. Never sent to the browser. |
| `DATABASE_URL` | server-only | Neon Postgres connection string used by the runtime + scripts. Includes the password — treat as a credential. |
| `CRON_SECRET` | server-only | Preferred. Authorizes `/api/internal/ingest`. Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically. |
| `INGEST_CRON_SECRET` | server-only | Backward-compatible fallback if `CRON_SECRET` isn't set. |
| `NEXT_PUBLIC_SITE_URL` | public | Used in metadata, sitemap, OG. Not a secret. |

## Operational rules

- **Never** print secrets in logs, error messages, code comments, README, or screenshots.
- **Never** import server-only env vars (`DATABASE_URL`, `GEMINI_API_KEY`, `CRON_SECRET`, `INGEST_CRON_SECRET`) from client components or modules that aren't route handlers / server components.
- **Never** ship `DATABASE_URL` or any cron/Gemini secret to a browser bundle. Verify with `next build` output (no `NEXT_PUBLIC_` prefix on any of them).
- The internal ingestion endpoint (`/api/internal/ingest`) requires `Authorization: Bearer <secret>`. The route resolves the secret as `CRON_SECRET ?? INGEST_CRON_SECRET` and uses constant-time comparison.
- If a secret is suspected of being exposed: rotate immediately, then audit recent usage from the provider's dashboard. For `DATABASE_URL`, also rotate the Neon role's password.

## Reporting

If you find a vulnerability or accidental secret exposure, do not open a public issue. Email the project maintainer directly.
