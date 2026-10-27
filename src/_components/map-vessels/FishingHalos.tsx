import { clusterEnvelope } from "@/_lib/map-vessels/fishingClusterLogic";
import { GpsLocation } from "@/_types/gps_location";
import { Circle } from "react-leaflet";

export function FishingHalos({ fishingClusters }: { fishingClusters: GpsLocation[][] }) {
  return (
    <>
      {fishingClusters.map((cluster: GpsLocation[], ci: number) => {
        const { center, radius } = clusterEnvelope(cluster);
        return (
          <Circle
            key={`fc-${ci}`}
            center={center}
            radius={radius}
            fillColor="#f97316"
            fillOpacity={0.10}
            color="#f97316"
            weight={1.5}
            opacity={0.35}
            dashArray="6 4"
          />
        );
      })}
    </>
  );
}
