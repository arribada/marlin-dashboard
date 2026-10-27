'use client';

import { MapPinned } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import dynamic from "next/dynamic";
import { Alert } from "@/_types/alert";
import { useMapFilters } from "../../_hooks/useMapFilters";
import MapHeader from "../map-alerts/MapHeader";

interface AnalystMapWrapperProps {
  alerts: Alert[];
  errorMessage: string;
}

const AlertMap = dynamic(() => import('@/_components/map-alerts/AlertMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

export default function MapWrapper({ alerts, errorMessage}: AnalystMapWrapperProps) {
   const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    showBycatch,
    setShowBycatch,
    showAlerts,
    setShowAlerts,
    showIcesAreas,
    setShowIcesAreas,
    alertTypeText,
    filteredAlerts,
  } = useMapFilters({ alerts });

  return (
    <Card className="mt-6 gap-3" data-testid="map-wrapper">
      <MapHeader
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        showBycatch={showBycatch}
        showAlerts={showAlerts}
        onBycatchChange={setShowBycatch}
        onAlertsChange={setShowAlerts}
        showIcesAreas={showIcesAreas}
        onIcesAreasChange={setShowIcesAreas}
        alertTypeText={alertTypeText}
      />

      <div className="w-full py-6 border-b gap-6">
        <CardContent className="space-y-4 w-full" data-testid="map-content">
          <div className="flex items-center gap-2 mb-4 text-ocean-blue">
            <MapPinned className="h-5 w-5" />
            <h3>Map:</h3>
          </div>
            <p className="text-muted-foreground text-sm text-right">
              {showIcesAreas && (
                <>
                  <br />
                  Hover over map to see ICES area name.
                </>
              )}
            </p>
          <div className="relative rounded-lg overflow-hidden h-[600px] w-full min-h-[600px]">
            <AlertMap
              alerts={filteredAlerts}
              alertErrorMessage={errorMessage}
              showIcesAreas={showIcesAreas}
            />
          </div>
        </CardContent>

      </div>
    </Card>
  );
}
