'use client';

import { useState, useMemo } from "react";
import { Alert, AdminAlert, isAdminAlert } from "@/_types/alert";

interface UseMapFiltersProps {
  alerts: Alert[] | AdminAlert[];
  initialVessels?: number[];
}

export function useMapFilters({ alerts, initialVessels = [] }: UseMapFiltersProps) {
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedVessels, setSelectedVessels] = useState<number[]>(initialVessels);
  const [showBycatch, setShowBycatch] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showIcesAreas, setShowIcesAreas] = useState(true);

  const alertTypeText =
    showBycatch && !showAlerts
      ? "all bycatch"
      : !showBycatch && showAlerts
      ? "all alerts"
      : !showBycatch && !showAlerts
      ? "no alerts"
      : "all bycatch and alerts";

  const vesselCountText =
    selectedVessels.length === 0
      ? "no vessels"
      : selectedVessels.length === 1
      ? "1 vessel"
      : `${selectedVessels.length} vessels`;

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {

      if (isAdminAlert(alert)) {
        if (selectedVessels.length === 0 || !selectedVessels.includes(alert.vesselId)) {
          return false;
        }
      }

      // Filter by date range
      const alertStart = new Date(alert.time);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      if (alertStart < start || alertStart > end) {
        return false;
      }

      // Filter by species detected
      const isBycatch = (alert.speciesDetected?.length ?? 0) > 0;
      if (isBycatch && !showBycatch) return false;
      if (!isBycatch && !showAlerts) return false;

      return true;
    });
  }, [alerts, selectedVessels, startDate, endDate, showBycatch, showAlerts]);

  return {
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
  };
}
