import { getLatestSnapshot } from "@/lib/snapshot";
import { metaFor } from "@/lib/api";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export async function GET() {
  const snap = await getLatestSnapshot();
  const body = JSON.stringify(
    {
      data: {
        as_of: snap.as_of,
        data_status: snap.data_status,
        totals: snap.totals,
        by_country: snap.by_country,
        events: snap.events,
        timeline: snap.timeline,
        sources_used: snap.sources_used,
        last_checked: snap.last_checked,
      },
      meta: metaFor(snap),
    },
    null,
    2,
  );
  const stamp = snap.as_of.slice(0, 10);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="hantavirus-${stamp}.json"`,
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
