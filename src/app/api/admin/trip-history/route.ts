import { NextRequest } from "next/server";
import { toCamelCase } from "@/_utils/formatting";
import { requireAdmin } from "@/_lib/api/route-helpers";
import { fetchDB } from "@/_lib/database/client";

export async function GET(req: NextRequest) {
  const result = await requireAdmin(req, "admin/trip-history API");
  if (!result.ok) return result.response;

  const { searchParams } = new URL(req.url);
  const vesselId = searchParams.get("v");
  if (!vesselId) return Response.json({ error: "[admin/trip-history API] Missing vessel ID" }, { status: 400 });

  try {
    const data = await fetchDB("/admin/trip-history", { vessel_id: vesselId});
    return Response.json(toCamelCase(data.admin_trip_history) ?? []);
  } catch (error) {
    console.error("[admin/trip-history API] DB request error:", error);
    return Response.json({ error: "Failed to fetch trip history data" }, { status: 500 });
  }
}
