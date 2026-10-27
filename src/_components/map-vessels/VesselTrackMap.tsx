'use client';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader } from "@/_components/ui/card";
import { Map, MapPin } from "lucide-react";
import { GpsLocation } from "@/_types/gps_location";
import { Alert } from "@/_types/alert";
import { SpeedGradient } from "./SpeedGradient";
import { MarkersList } from "./MarkersList";
import { Badge } from "../ui/badge";
import { FishingClusters } from "./FishingClusters";
import { detectFishingClusters, FISHING_MIN_RUN, FISHING_THRESHOLD } from "@/_lib/map-vessels/fishingClusterLogic";
import { FishingHalos } from "./FishingHalos";
import { TrackPoints } from "./TrackPoints";
import { DirectionalArrows } from "./DirectionalArrows";
import { AlertMarkers } from "./AlertMarkers";
import { StartEndMarkers } from "./StartEndMarkers";
import { SpeedTrack } from "./SpeedTrack";
import { hasValidCoordinates } from "@/_lib/map-vessels/hasValidCoordinates";

// ─── Inner map component (must be inside MapContainer) ───────────────────────
interface MapInnerProps {
  points: GpsLocation[];
  alerts: Alert[];
}

function MapInner({ points, alerts }: MapInnerProps) {
  const map = useMap();
  const [zoom, setZoom] = useState<number>(map.getZoom());

  useMapEvents({ zoom: () => setZoom(map.getZoom()) });

  // Auto-fit to trip bounds once on mount
  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding: [48, 48] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Zoom-based point thinning for interactive markers
  const visiblePoints = useMemo(() => {
    if (zoom >= 14) return points;
    if (zoom >= 12) return points.filter((_, i) => i % 3 === 0);
    if (zoom >= 10) return points.filter((_, i) => i % 7 === 0);
    return points.filter((_, i) => i % 14 === 0);
  }, [zoom, points]);

  const fishingClusters = useMemo(() => detectFishingClusters(points), [points]);

  // Directional arrows: one every ~15 source points, skip start/end vicinity
  const arrowPoints = useMemo(
    () => points.filter((_, i) => i > 5 && i < points.length - 5 && i % 15 === 7),
    [points]
  );

  const startPt = points[0];
  const endPt = points[points.length - 1];

  // Not using validateEnvVar() here, Next.js only inlines NEXT_PUBLIC_* vars for a
  // static `process.env.NEXT_PUBLIC_X` reference, not a dynamic helper lookup.
  const CARTO_API_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY;
  if (!CARTO_API_KEY) {
    throw new Error('[ENV] Missing required environment variable: NEXT_PUBLIC_CARTO_API_KEY');
  }

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`}
        maxZoom={20}
      />

      <SpeedTrack points={points} />

      <FishingHalos fishingClusters={fishingClusters} />

      <TrackPoints visiblePoints={visiblePoints} />

      <DirectionalArrows arrowPoints={arrowPoints} />

      <AlertMarkers alerts={alerts} />

      <StartEndMarkers startPt={startPt} endPt={endPt} />
    </>
  );
}

// ─── Main exported component ─────────────────────────────────────────────────
interface VesselTrackMapProps {
  points: GpsLocation[];
  alerts: Alert[];
}

export function VesselTrackMap({ points, alerts }: VesselTrackMapProps) {
  const validPoints = useMemo(() => points.filter(hasValidCoordinates), [points]);

  const fishingClusters = useMemo(() => detectFishingClusters(validPoints), [validPoints]);

  const hasPoints = validPoints.length > 0;
  const maxSpeed = useMemo(
    () => (hasPoints ? Math.max(...validPoints.map((p) => p.speed)) : 0),
    [validPoints, hasPoints]
  );
  const avgSpeed = useMemo(
    () => (hasPoints ? validPoints.reduce((s, p) => s + p.speed, 0) / validPoints.length : 0),
    [validPoints, hasPoints]
  );

  if (!hasPoints) {
    return (
      <Card className="overflow-hidden border-border mt-6">
        <CardHeader>
          <div className="flex items-center gap-3 text-ocean-blue">
            <Map className="h-6 w-6" />
            <h2>Vessel Track</h2>
          </div>
          <p className="text-muted-foreground">No GPS track data available for this trip.</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border mt-6">
      {/* ── Header ── */}
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-ocean-blue flex items-center gap-3">
            <Map className="h-6 w-6" />
            <h2>Vessel Track</h2>
          </div>
          <div className="flex">
            <Badge>
              <MapPin className="h-4 w-4" data-testid="location-icon"/>
              {validPoints.length} GPS points
            </Badge>
            <Badge>
              <span className="inline-block w-2.5 h-2.5 rounded-full border border-orange-400 bg-orange-100" />
              {fishingClusters.length} Fishing zones
            </Badge>
          </div>
        </div>
        <p className="text-muted-foreground">Vessel track showing departure, return to port, and any alerts or bycatch events along the route. Hover over a marker to view more info.</p>
      </CardHeader>

      {/* ── Map ── */}
      <div style={{ height: "460px" }}>
        <MapContainer
          style={{ height: "100%", width: "100%" }}
          center={[50.415, -4.205]}
          zoom={11}
          zoomControl
          attributionControl
        >
          <MapInner points={validPoints} alerts={alerts} />
        </MapContainer>
      </div>

      {/* ── Legend bar ── */}
      <div className="px-5 pb-3 flex flex-wrap gap-8 justify-start">
        <SpeedGradient avgSpeed={avgSpeed} maxSpeed={maxSpeed} />

        <FishingClusters min={FISHING_MIN_RUN} threshold={FISHING_THRESHOLD} />

        <MarkersList />
      </div>
    </Card>
  );
}
