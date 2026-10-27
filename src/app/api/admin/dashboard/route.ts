import { requireAdmin } from "@/_lib/api/route-helpers";
import { getRecentVesselLocations, mapAlertLike, mapTrips, mapVesselLocations, RawVesselRow, toDateCounts } from "@/_utils/mapping/dashboard";
import { supabaseServer } from "@/_lib/supabase/server";
import { NextRequest } from "next/server";
import { fetchDB } from "@/_lib/database/client";
import { AdminVessel } from "@/_types/vessel";
import { toCamelCase } from "@/_utils/formatting";

export async function GET(req: NextRequest) {
  const result = await requireAdmin(req, "admin/dashboard API");
  if (!result.ok) return result.response;

  const errors: Record<string, string> = {};
  const logError = (key: string, message: string, error: unknown) => {
    errors[key] = message;
    console.error(`[admin/dashboard] ${key}:`, error);
  };

  const [
    vesselResult,
    { data: tripsData, error: tripsError },
    { data: alertsData, error: alertsError },
    { data: recentAlertsData, error: recentAlertsError },
    { data: recentBycatchData, error: bycatchError },
  ] = await Promise.all([
    fetchDB("/admin/vessels", {}).then(
      (data) => ({ data: toCamelCase(data.admin_vessels), error: null }),
      (error) => ({ data: null, error })
    ),
    supabaseServer.from("admin_dashboard_trips").select("*"),
    supabaseServer.from("admin_dashboard_alerts").select("*").maybeSingle(),
    supabaseServer
      .from("alerts")
      .select("id, time, vessels(name)")
      .or("species_detected.is.null,species_detected.eq.{}")
      .order("time", { ascending: false })
      .limit(4),
    supabaseServer
      .from("alerts")
      .select("id, time, vessels(name)")
      .not("species_detected", "is", null)
      .neq("species_detected", "{}")
      .order("time", { ascending: false })
      .limit(4),
  ]);

  const vesselError = vesselResult.error;
  const vesselData = vesselResult.data as AdminVessel[] | null;

  if (vesselError) logError("vessels", "Failed to load vessel count", vesselError);
  if (tripsError) logError("trips", "Failed to load trip data", tripsError);
  if (alertsError) logError("alerts", "Failed to load alert count", alertsError);
  if (recentAlertsError) logError("recentAlerts", "Failed to load recent alerts", recentAlertsError);
  if (bycatchError) logError("recentBycatch", "Failed to load recent bycatch", bycatchError);

  if (Object.keys(errors).length > 0) {
    console.error("[admin/dashboard] One or more queries failed:", errors);
  }

  const mappedAlerts = recentAlertsError ? null : mapAlertLike("alert", recentAlertsData ?? []);
  const mappedBycatch = bycatchError ? null : mapAlertLike("bycatch", recentBycatchData ?? []);
  const recentVesselLocations = vesselError ? null : getRecentVesselLocations(vesselData ?? []);

  const data = {
    vessels: vesselError ? null : vesselData?.length ?? null,
    trips: tripsError ? null : mapTrips(tripsData ?? []),
    alerts: alertsError ? null : alertsData?.total_alerts ?? null,
    recentAlerts: mappedAlerts,
    recentBycatch: mappedBycatch,
    recentVesselLocations,
    alertsByDate: mappedAlerts ? toDateCounts(mappedAlerts) : null,
    bycatchByDate: mappedBycatch ? toDateCounts(mappedBycatch) : null,
    errors,
  };

  return Response.json(data);
}
