'use client';

import { MapPinned } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { VesselMinimal } from "@/_types/vessel";
import dynamic from "next/dynamic";
import { AdminAlert } from "@/_types/alert";
import VesselList from "../map-alerts/VesselList";
import { useMapFilters } from "../../_hooks/useMapFilters";
import MapHeader from "../map-alerts/MapHeader";

interface AdminMapWrapperProps {
  vessels: VesselMinimal[];
  alerts: AdminAlert[];
  vesselErrorMessage: string;
  alertErrorMessage: string;
}

const AlertMap = dynamic(() => import('@/_components/map-alerts/AlertMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

export default function MapWrapper({ alerts, vessels, vesselErrorMessage, alertErrorMessage}: AdminMapWrapperProps) {
   const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedVessels,
    setSelectedVessels,
    showBycatch,
    setShowBycatch,
    showAlerts,
    setShowAlerts,
    showIcesAreas,
    setShowIcesAreas,
    alertTypeText,
    vesselCountText,
    filteredAlerts,
  } = useMapFilters({
    alerts,
    initialVessels: vessels.map(v => v.id)
  });

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
        vesselCountText={vesselCountText}
      />

      {/* Vessel list */}
      <div className="flex flex-row w-full py-6 border-b gap-6 px-6">
        <VesselList
          vessels={vessels}
          vesselErrorMessage={vesselErrorMessage}
          selectedVessels={selectedVessels}
          onVesselsChange={setSelectedVessels}
        />

        <CardContent className="w-full" data-testid="map-content">
          <div className="flex justify-between mb-3">
            <div className="flex items-center gap-2 mb-4 text-ocean-blue">
              <MapPinned className="h-5 w-5" />
              <h3>Map:</h3>
            </div>
            <p className="text-muted-foreground text-sm text-right">
              Click on a marker to see alert details.
              {showIcesAreas && (
                <>
                  <br />
                  Hover over map to see ICES area name.
                </>
              )}
            </p>
          </div>

          <div className="relative rounded-lg overflow-hidden h-[600px] w-full min-h-[600px]">
            <AlertMap
              alerts={filteredAlerts}
              alertErrorMessage={alertErrorMessage}
              showIcesAreas={showIcesAreas}
            />
          </div>
        </CardContent>

      </div>
    </Card>
  );
}
