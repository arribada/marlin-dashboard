/**
 * ⚠️ SERVER COMPONENT ONLY
 *
 * This component fetches authenticated trip data for the fisher role.
 * It relies on server-side cookies and the session token to determine
 * which vessel’s trips to show.
 *
 * Keeping this server-only ensures that:
 * 1. HttpOnly session cookies are never exposed to client-side JavaScript.
 * 2. Sensitive vessel and trip data is fetched in a secure server context.
 *
 */

import { Card, CardHeader } from '@/_components/ui/card';
import { Ship } from 'lucide-react';
import TripHistoryTable from '@/_components/fisher/TripHistoryTable';
import type { TripSummary } from '@/_types/trip';
import SummaryStatistics from '@/_components/SummaryStatistics';
import { cookies } from 'next/headers';

export default async function FisherDashboard() {
  const cookieStore = await cookies();
  let trips: TripSummary[] = [];
  let errorMessage: string | null = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/fisher/trip-history`,
      { cache: "no-store", headers: { Cookie: cookieStore.toString() } }
    );

    if (!res.ok) {
      errorMessage = "Unable to load trip history. Please try again later.";
    } else {
      trips = await res.json();
    }
  } catch (error) {
    console.error("[FisherDashboard] Error fetching trip history:", error);
    errorMessage = "Unable to load trip history. Please try again later.";
  }

  // TODO: update backend to return vessel name as its own top-level field
  const vesselName = trips[0]?.vesselName ?? "Unknown Vessel";

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Ship className="h-6 w-6 text-ocean-blue" />
                    <h2 className="text-ocean-blue">Trip History - {vesselName}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Complete voyage record and fishing activity analysis
                  </p>
                </div>
              </div>
            </div>

            <SummaryStatistics trips={trips} />

          </div>
        </CardHeader>
      </Card>

      <TripHistoryTable trips={trips} errorMessage={errorMessage} />
    </>
  );
}
