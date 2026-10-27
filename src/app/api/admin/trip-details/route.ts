import { NextRequest } from "next/server";
import { toCamelCase } from "@/_utils/formatting";
import { requireAdmin } from "@/_lib/api/route-helpers";
import { fetchDB } from "@/_lib/database/client";

export async function GET(req: NextRequest) {
  const tag = "GET /api/admin/trip-details";

  const auth = await requireAdmin(req, tag);
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const tripId = url.searchParams.get("trip");
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");

  if (!tripId || tripId == 'undefined')
    return Response.json({ error: "[admin/trip-details API] No trip ID provided" }, { status: 400 });

  try {
    const params: Record<string, string> = { trip_id: tripId };
    if (start && end) {
      params.start = start;
      params.end = end;
    }

    const data = await fetchDB("/admin/trip-details", params);

    const dataWithTypes = {
      ...data.admin_trip_details,
      recordings: data.admin_trip_details.recordings?.map((recording: { species_detected: string | any[]; }) => ({
        ...recording,
        type: recording.species_detected && recording.species_detected.length > 0
          ? "bycatch"
          : "alert"
      }))
    };

    return Response.json(toCamelCase(dataWithTypes));
  } catch (error) {
    console.error("[admin/trip-details API] DB request error:", error);
    return Response.json({ error: "Failed to fetch trip data" }, { status: 500 });
  }
}
