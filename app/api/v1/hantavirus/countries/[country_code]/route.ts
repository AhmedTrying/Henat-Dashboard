import { getLatestSnapshot } from "@/lib/snapshot";
import { jsonResponse, metaFor } from "@/lib/api";

export const revalidate = 300;

export async function GET(
  _req: Request,
  context: { params: Promise<{ country_code: string }> },
) {
  const { country_code } = await context.params;
  const code = country_code.toUpperCase();

  if (!/^[A-Z]{2}$/.test(code)) {
    return jsonResponse(
      {
        error: {
          code: "invalid_country_code",
          message:
            "Country code must be a two-letter ISO 3166-1 alpha-2 code (e.g. AR, US).",
        },
      },
      { status: 400 },
    );
  }

  const snap = await getLatestSnapshot();
  const country = snap.by_country.find((c) => c.country_code === code);

  if (!country) {
    return jsonResponse(
      {
        error: {
          code: "country_not_found",
          message: `No data for country code "${code}" in the latest snapshot.`,
        },
        meta: metaFor(snap),
      },
      { status: 404 },
    );
  }

  const events = snap.events.filter((e) => e.country_code === code);

  return jsonResponse({
    data: {
      country,
      events,
    },
    meta: metaFor(snap),
  });
}
