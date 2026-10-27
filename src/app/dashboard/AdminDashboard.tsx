import DashboardCards from '@/_components/DashboardCards';
import { requireAdminSession } from '@/_lib/auth-helpers';
import { cookies } from 'next/headers';
import { Kpi } from '@/_components/ui/kpi';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import TripFrequencyChart from '@/_components/TripFrequencyChart';
import { AdminAlert, AlertDateCount } from '@/_types/alert';
import { RecentVesselLocation } from "@/_types/vessel";
import { TripDateCount } from '@/_types/trip';
import { Button } from '@/_components/ui/button';

export default async function AdminDashboard() {
  await requireAdminSession();

  const cookieStore = await cookies();

  let vessels: number | null = null;
  let trips: TripDateCount[] | null = null;
  let alerts: number | null = null;
  let systemErrors: number | null = null;
  let recentAlerts: AdminAlert[] | null = null;
  let recentBycatch: AdminAlert[] | null = null;
  let recentVesselLocations: RecentVesselLocation[] | null = null;
  let alertsByDate: AlertDateCount[] | null = null;
  let bycatchByDate: AlertDateCount[] | null = null;
  let errors: Record<string, string> = {};
  let fetchError = "";

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/dashboard`,
      { cache: "no-store", headers: { Cookie: cookieStore.toString() } }
    );

    if (!res.ok) {
      fetchError = "Unable to load data. Please try again later.";
    } else {
      const data = await res.json();
      vessels = data.vessels;
      trips = data.trips;
      alerts = data.alerts;
      // Placeholder until this is implemented
      systemErrors = 2;
      recentAlerts = data.recentAlerts;
      recentBycatch = data.recentBycatch;
      recentVesselLocations = data.recentVesselLocations;
      alertsByDate = data.alertsByDate;
      bycatchByDate = data.bycatchByDate;
      errors = data.errors ?? {};
    }
  } catch (error) {
    console.error("[AdminDashboard] Error fetching data:", error);
    fetchError = "Unable to load data. Please try again later.";
  }

  if (fetchError) {
    // Duplicate of Retry component to avoid importing client component into server component
    return (
      <div
        className="flex flex-col items-center justify-center py-8 px-4 text-center"
        data-testid="retry-component"
      >
        <AlertCircle className="h-5 w-5 text-destructive mb-3" />
        <p className="text-sm text-muted-foreground">{fetchError}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
        >
          <a href="/dashboard">Try Again</a>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi
          title="Active Vessels"
          value={vessels ?? "-"}
          description="vessels in the fleet"
          borderClass="border-l-ocean-blue"
          colorClass="bg-ocean-blue"
          textClass="text-ocean-blue"
          error={errors.vessels}
        />

        <Kpi
          title="Total Trips"
          value={trips ? trips.reduce((sum, t) => sum + t.events, 0) : "-"}
          description="recorded this week"
          borderClass="border-l-aqua"
          colorClass="bg-aqua"
          textClass="text-aqua"
          error={errors.trips}
        />

        <Kpi
          title="Alerts"
          value={alerts ?? "-"}
          description="logged this week"
          borderClass="border-l-amber-300"
          colorClass="bg-amber-300"
          textClass="text-amber-500"
          icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
          error={errors.alerts}
        />

        <Kpi
          title="System Errors"
          value={systemErrors ?? "-"}
          description="logged this week"
          borderClass="border-l-destructive"
          colorClass="bg-destructive"
          textClass="text-destructive"
          icon={<AlertTriangle className="w-4 h-4 text-destructive" />}
          error={errors.systemErrors}
        />
      </div>

      <TripFrequencyChart
        trips={trips}
        alerts={alertsByDate}
        bycatch={bycatchByDate}
        error={errors.trips}
      />

      <DashboardCards
        alerts={recentAlerts}
        bycatch={recentBycatch}
        vessels={recentVesselLocations}
        errors={errors}
      />
    </>
  );
}
