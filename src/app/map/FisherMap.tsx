import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/_components/ui/button";
import { Card, CardHeader } from "@/_components/ui/card";
import { Alert } from "@/_types/alert";
import MapWrapper from "@/_components/fisher/MapWrapper";
import { FILTER_START_DATE } from "@/_lib/constants";
import { cookies } from "next/headers";

export default async function FisherMap() {
  const cookieStore = await cookies();
  let alerts: Alert[] = [];
  let alertErrorMessage = "";

  const start = FILTER_START_DATE;
  const end = new Date();

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/fisher/map?start=${start.toISOString()}&end=${end.toISOString()}`,
      { cache: "no-store", headers: { Cookie: cookieStore.toString() } }
    );

    if (!res.ok) {
      alertErrorMessage = "Failed to load alerts";
    } else {
      alerts = await res.json();
    }
  } catch (error) {
    console.error("[FisherMap] Error fetching data:", error);
    alertErrorMessage = "Failed to load alerts";
  }

  return (
    <>
      <Card>
        <CardHeader className="border-b">
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
                See anonymised alert patterns from other vessels operating in UK waters.
                <br />
                Filter alerts by vessel, date, and type to analyse bycatch patterns and improve operational safety.
              </p>
            </div>

          </div>
        </CardHeader>
      </Card>

      <MapWrapper
        alerts={alerts}
        errorMessage={alertErrorMessage}
      />
    </>
  );
}
