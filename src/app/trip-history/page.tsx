/**
 * Admin-only page, Analysts do not have access to any vessel's trip history
 * Fisher's have access to their own trip-history via their dashboards
 */
import { Card, CardHeader } from '@/_components/ui/card';
import { ArrowLeft } from 'lucide-react';
import TripHistoryTable from '@/_components/admin/TripHistoryTable';
import type { AdminTripSummary } from '@/_types/trip';
import SummaryStatistics from '@/_components/SummaryStatistics';
import { requireAdminSession } from '@/_lib/auth-helpers';
import { cookies } from 'next/headers';
import { Button } from '@/_components/ui/button';
import Link from 'next/link';

type TripHistoryProps = {
  searchParams: Promise<{v?: string, name?: string}>;
};

export default async function TripHistory({searchParams}: TripHistoryProps) {
  await requireAdminSession();
  const params = await searchParams;
  const cookieStore = await cookies();

  let trips: AdminTripSummary[] = [];
  let errorMessage: string | null = null;
  let vesselName: string | null = null;

  try {
    const vesselId = params.v;
    vesselName = params.name ? decodeURIComponent(params.name) : "Unknown vessel";

    if (!vesselId) {
      errorMessage = "No vessel selected. Please select a vessel from the vessels page.";
    } else {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/trip-history?v=${vesselId}`,
        { cache: "no-store", headers: { Cookie: cookieStore.toString() } }
      );

      if (!res.ok) {
        errorMessage = "Unable to load trip history. Please try again later.";
      } else {
        trips = await res.json();
      }
    }
  } catch (error) {
    console.error("[AdminTripHistory] Error fetching trip history:", error);
    errorMessage = "Unable to load trip history. Please try again later.";
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Link href="/dashboard" >
                        <ArrowLeft className="h-5 w-5" />
                      </Link>
                    </Button>
                    <h1 className="text-ocean-blue">Trip History - {vesselName}</h1>
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
