import { NextRequest } from "next/server";
import { toCamelCase } from "@/_utils/formatting";
import { extractVesselId, requireFisher } from "@/_lib/api/route-helpers";
import { fetchDB } from "@/_lib/database/client";

export async function GET(req: NextRequest) {
  const result = await requireFisher(req, "fisher/trip-history API");
  if (!result.ok) return result.response;

  const vesselId = extractVesselId(result.token, "fisher/trip-history API");
  if (vesselId instanceof Response) return vesselId;

  try {
    const data = await fetchDB("/fisher/trip-history", { vessel_id: vesselId});
    return Response.json(toCamelCase(data.trip_history) ?? []);
  } catch (error) {
    console.error("[fisher/trip-history API] DB request error:", error);
    return Response.json({ error: "Failed to fetch trip history data" }, { status: 500 });
  }
}
