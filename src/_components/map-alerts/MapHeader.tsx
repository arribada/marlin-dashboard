'use client';

import { CardHeader } from "../ui/card";
import { formatDateShortMonth } from "@/_utils/formatting";
import DateRangePicker from "./DateRangePicker";
import AlertTypeToggles from "./AlertTypeToggles";
import IcesLayerToggle from "./IcesLayerToggle";

interface MapHeaderProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  showBycatch: boolean;
  showAlerts: boolean;
  onBycatchChange: (checked: boolean) => void;
  onAlertsChange: (checked: boolean) => void;
  showIcesAreas: boolean;
  onIcesAreasChange: (checked: boolean) => void;
  alertTypeText: string;
  vesselCountText?: string;
}

export default function MapHeader({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  showBycatch,
  showAlerts,
  onBycatchChange,
  onAlertsChange,
  showIcesAreas,
  onIcesAreasChange,
  alertTypeText,
  vesselCountText,
}: MapHeaderProps) {
  return (
    <CardHeader className="border-b">
      <div className="items-start justify-between gap-4 w-full">
        <h2 className="text-ocean-blue font-normal mb-6">
          Displaying{' '}
          <span className="font-medium">{alertTypeText}</span>
          {' '}between{' '}
          <span className="font-medium">{formatDateShortMonth(startDate)}</span>
          {' '}and{' '}
          <span className="font-medium">{formatDateShortMonth(endDate)}</span>

          {vesselCountText && (
            <>
              {' '}for{' '}
              <span className="font-medium">{vesselCountText}</span>:
            </>
          )}
        </h2>

        <div className="flex justify-between gap-6 flex-1">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />

          <div className="flex flex-col items-start gap-3">
            <AlertTypeToggles
              showBycatch={showBycatch}
              showAlerts={showAlerts}
              onBycatchChange={onBycatchChange}
              onAlertsChange={onAlertsChange}
            />
            <IcesLayerToggle
              showIcesAreas={showIcesAreas}
              onIcesAreasChange={onIcesAreasChange}
            />
          </div>
        </div>

      </div>
    </CardHeader>
  );
}
