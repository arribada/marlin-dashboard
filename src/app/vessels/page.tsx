import { ArrowLeft, Ship } from "lucide-react";
import Link from "next/link";
import VesselTable from "@/_components/VesselTable";
import { Button } from "@/_components/ui/button";
import { Card, CardHeader } from "@/_components/ui/card";
import { requireAdminSession } from '@/_lib/auth-helpers';
import { cookies } from "next/headers";

export default async function VesselsPage() {
  await requireAdminSession();

  const cookieStore = await cookies();
  let vessels = [];
  let errorMessage = "";

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/vessels`,
      { cache: "no-store", headers: { Cookie: cookieStore.toString() } }
    );

    if (!res.ok) {
      errorMessage = "Unable to load vessel data. Please try again later.";
    } else {
      vessels = await res.json();
    }
  } catch (error) {
    console.error("[VesselsPage] Error fetching vessel data:", error);
    errorMessage = "Unable to load vessel data. Please try again later.";
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Link href="/dashboard" >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
              <div className="flex items-center gap-3 mb-2 text-ocean-blue">
                <Ship className="h-6 w-6" data-testid="vessel-icon" />
                <h1 className="" data-testid="vessel-name">
                  Vessels Overview
                </h1>
              </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  Vessel positions, registrations, and alerts, with last known locations and timestamps.
                  <br />
                  Select any vessel to explore its complete trip history.
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <VesselTable vessels={vessels} errorMessage={errorMessage}/>
    </>
  );
};
