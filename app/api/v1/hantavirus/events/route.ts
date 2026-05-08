import { getLatestSnapshot } from "@/lib/snapshot";
import { jsonResponse, metaFor } from "@/lib/api";

export const revalidate = 300;

export async function GET() {
  const snap = await getLatestSnapshot();
  return jsonResponse({
    data: {
      events: snap.events,
      count: snap.events.length,
      active_count: snap.events.filter((e) => e.status === "active").length,
    },
    meta: metaFor(snap),
  });
}
