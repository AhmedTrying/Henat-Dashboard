import { getLatestSnapshot } from "@/lib/snapshot";
import { jsonResponse, metaFor } from "@/lib/api";

export const revalidate = 300;

export async function GET() {
  const snap = await getLatestSnapshot();
  return jsonResponse({
    data: {
      countries: snap.by_country,
      count: snap.by_country.length,
    },
    meta: metaFor(snap),
  });
}
