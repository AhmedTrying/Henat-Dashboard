import { getLatestSnapshot } from "@/lib/snapshot";
import { snapshotToCsv } from "@/lib/api";

export const revalidate = 300;

export async function GET() {
  const snap = await getLatestSnapshot();
  const csv = snapshotToCsv(snap);
  const stamp = snap.as_of.slice(0, 10);
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hantavirus-${stamp}.csv"`,
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
