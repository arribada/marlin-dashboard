import { NextRequest } from "next/server";
import { toCamelCase } from "@/_utils/formatting";
import { extractVesselId, requireFisher } from "@/_lib/api/route-helpers";
import { fetchDB } from "@/_lib/database/client";

export async function GET(req: NextRequest) {
  const result = await requireFisher(req, "fisher/media-by-range API");
  if (!result.ok) return result.response;

  const vesselId = extractVesselId(result.token, "fisher/media-by-range API");
  if (vesselId instanceof Response) return vesselId;

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const types = searchParams.getAll("type");

  if (!start || !end || types.length === 0) {
    return Response.json({ error: "Missing required params: start, end, type" }, { status: 400 });
  }

  try {
    const data = await fetchDB("/fisher/media-by-range", { vessel_id: vesselId, start, end, types });
    return Response.json(toCamelCase(data.media) ?? []);
  } catch (error) {
    console.error("[fisher/media-by-range API] DB request error:", error);
    return Response.json({ error: "Failed to fetch media data" }, { status: 500 });
  }
}
