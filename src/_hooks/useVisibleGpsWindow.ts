import { TIMELINE_CONFIG } from '@/_lib/constants';
import { GpsLocation } from '@/_types/gps_location';
import { TripIdentifier } from '@/_types/trip';
import { useEffect, useRef, useState } from 'react';
interface UseVisibleGpsWindowArgs {
  identifier: TripIdentifier;
  tripStart: Date;
  tripEnd: Date;
  initialGps: GpsLocation[];
  zoomLevel: number;
  panOffset: number;
}

interface TripDetailsGpsResponse {
  gps: GpsLocation[] | null;
}

export function useVisibleGpsWindow({
  identifier,
  tripStart,
  tripEnd,
  initialGps,
  zoomLevel,
  panOffset,
}: UseVisibleGpsWindowArgs) {
  const tripDurationMs = Math.max(tripEnd.getTime() - tripStart.getTime(), 1);
  const visibleDurationMs = tripDurationMs / zoomLevel;
  const visibleStart = new Date(tripStart.getTime() + (tripDurationMs - visibleDurationMs) * (panOffset / 100));
  const visibleEnd = new Date(visibleStart.getTime() + visibleDurationMs);

  const [gpsData, setGpsData] = useState(initialGps);
  const [gpsLoading, setGpsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (zoomLevel === 1 && panOffset === 0) {
      abortRef.current?.abort();
      setGpsLoading(false);
      setGpsData(initialGps);
      return;
    }

    const handle = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setGpsLoading(true);

      // Narrowing on identifier.role picks out the matching field
      // (name for fisher, id for admin) — TypeScript won't let this
      // fall out of sync with the union definition above.
      const tripParamValue = identifier.role === 'fisher' ? identifier.name : identifier.id;

      const params = new URLSearchParams({
        trip: tripParamValue,
        start: visibleStart.toISOString(),
        end: visibleEnd.toISOString(),
      });

      fetch(`/api/${identifier.role}/trip-details?${params.toString()}`, { signal: controller.signal })
        .then(async res => {
          if (!res.ok) {
            const body = await res.text().catch(() => '');
            throw new Error(`Trip details fetch failed: ${res.status} ${res.statusText} ${body}`);
          }
          return res.json();
        })
        .then((data: TripDetailsGpsResponse) => setGpsData(data.gps ?? []))
        .catch(err => {
          if (err?.name !== 'AbortError') console.error('[useVisibleGpsWindow] refetch failed:', err.message ?? err);
        })
        .finally(() => setGpsLoading(false));
    }, TIMELINE_CONFIG.FETCH_DEBOUNCE_MS);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleStart.getTime(), visibleEnd.getTime(), zoomLevel, panOffset]);

  return { gpsData, gpsLoading, visibleStart, visibleEnd };
}
