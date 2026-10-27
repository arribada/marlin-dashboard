import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdminSession } from "@/_lib/auth-helpers";
import { FILTER_START_DATE } from "@/_lib/constants";
import { AdminAlert } from "@/_types/alert";
import { VesselMinimal } from "@/_types/vessel";
import MapWrapper from "@/_components/admin/MapWrapper";
import { Button } from "@/_components/ui/button";
import { Card, CardHeader } from "@/_components/ui/card";

export default async function AdminMap() {
  await requireAdminSession();
  const cookieStore = await cookies();

  let vessels: VesselMinimal[] = [];
  let alerts: AdminAlert[] = [];
  let vesselErrorMessage = "";
  let alertErrorMessage = "";

  try {
    const vesselRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/vessels?fields=minimal`,
      { cache: "no-store", headers: { Cookie: cookieStore.toString() } }
    );

    if (!vesselRes.ok) {
      vesselErrorMessage = "Unable to load vessel data. Please try again later.";
    } else {
      vessels = await vesselRes.json();
      const vesselIds = vessels.map(v => v.id!);

      if (vesselIds.length > 0) {
        const start = FILTER_START_DATE;
        const end = new Date();

        const alertRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/map?start=${start.toISOString()}&end=${end.toISOString()}`,
          { cache: "no-store", headers: { Cookie: cookieStore.toString() }}
        );

        if (!alertRes.ok) {
          alertErrorMessage = "Unable to load alert data. Please try again later.";
        } else {
          alerts = await alertRes.json();
        }
      }
    }
  } catch (error) {
    console.error("[AdminMap] Error fetching data:", error);

    if (!vessels.length && !vesselErrorMessage) {
      vesselErrorMessage = "An unexpected error occurred loading vessels.";
    }

    if (!alerts.length && !alertErrorMessage && vessels.length > 0) {
      alertErrorMessage = "An unexpected error occurred loading alerts.";
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-6">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Link href="/dashboard" >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>

            <div>
              <div className="mb-2 text-ocean-blue">
                <h1>Alerts Map</h1>
              </div>

              <p className="text-sm text-muted-foreground">
                Monitor alert distribution and identify hotspots across your fleet.
                <br />
                Filter alerts by vessel, date, and type to analyse bycatch patterns and improve operational safety.
              </p>
            </div>

          </div>
        </CardHeader>
      </Card>

      <MapWrapper
        alerts={alerts}
        vessels={vessels}
        vesselErrorMessage={vesselErrorMessage}
        alertErrorMessage={alertErrorMessage}
      />
    </>
  );
}
