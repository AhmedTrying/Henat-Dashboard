import { getLatestSnapshot } from "@/lib/snapshot";
import { jsonResponse, metaFor } from "@/lib/api";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export async function GET() {
  const snap = await getLatestSnapshot();
  return jsonResponse({
    data: {
      as_of: snap.as_of,
      data_status: snap.data_status,
      totals: snap.totals,
      last_checked: snap.last_checked,
    },
    meta: metaFor(snap),
  });
}
