import { NextRequest } from "next/server";
import { toCamelCase } from "@/_utils/formatting";
import { extractVesselId, requireFisher } from "@/_lib/api/route-helpers";
import { fetchDB } from "@/_lib/database/client";
import { parseTripDataSource, TripDataSource } from "@/_types/trip";

const DB_ENDPOINTS: Record<TripDataSource, string> = {
  cls: "/fisher/trip-details",
  mobile: "/fisher/alt-trip-details",
};

export async function GET(req: NextRequest) {
  const result = await requireFisher(req, "fisher/trip-details API");
  if (!result.ok) return result.response;

  const vesselId = extractVesselId(result.token, "fisher/trip-details API");
  if (vesselId instanceof Response) return vesselId;

  const url = new URL(req.url);
  const tripName = url.searchParams.get("trip");
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  const source = parseTripDataSource(url.searchParams.get("source"));

  if (!tripName)
    return Response.json({ error: "[fisher/trip-details API] No trip name provided" }, { status: 400 });

  try {
    const params: Record<string, string> = { vessel_id: String(vesselId), name: tripName };
    if (start && end) {
      params.start = start;
      params.end = end;
    }

    const data = await fetchDB(DB_ENDPOINTS[source], params);

    if (data.trip_details.vessel_id !== vesselId) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const dataWithTypes = {
      ...data.trip_details,
      gps: data.trip_details.gps ?? [],
      recordings: (data.trip_details.recordings ?? []).map((recording: { species_detected: string | any[]; }) => ({
        ...recording,
        type: recording.species_detected && recording.species_detected.length > 0
          ? "bycatch"
          : "alert"
      }))
    };

    return Response.json(toCamelCase(dataWithTypes));
  } catch (error) {
    console.error("[fisher/trip-history API] DB request error:", error);
    return Response.json({ error: "Failed to fetch trip data" }, { status: 500 });
  }
}
