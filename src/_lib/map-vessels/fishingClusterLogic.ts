import { GpsLocation } from "@/_types/gps_location";
import { hasValidCoordinates } from "./hasValidCoordinates";

export const FISHING_THRESHOLD = 1.5;  // knots
export const FISHING_MIN_RUN = 5;    // consecutive points

export function detectFishingClusters(points: GpsLocation[]): GpsLocation[][] {
  const validPoints = points.filter(hasValidCoordinates);
  const clusters: GpsLocation[][] = [];
  let run: GpsLocation[] = [];
  for (const pt of validPoints) {
    if (pt.speed < FISHING_THRESHOLD) {
      run.push(pt);
    } else {
      if (run.length >= FISHING_MIN_RUN) clusters.push([...run]);
      run = [];
    }
  }
  if (run.length >= FISHING_MIN_RUN) clusters.push(run);
  return clusters;
}

export function clusterEnvelope(cluster: GpsLocation[]): { center: [number, number]; radius: number } {
  const lats = cluster.map((p) => p.latitude);
  const lngs = cluster.map((p) => p.longitude);
  const cLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const cLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  const radM = Math.max(
    ...cluster.map((p) => {
      const dlat = (p.latitude - cLat) * 111_000;
      const dlng = (p.longitude - cLng) * 111_000 * Math.cos((cLat * Math.PI) / 180);
      return Math.sqrt(dlat * dlat + dlng * dlng);
    }),
    350
  ) + 220;
  return { center: [cLat, cLng], radius: radM };
}
