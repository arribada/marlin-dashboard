import { GpsLocation } from "@/_types/gps_location";
import { speedToColor } from "@/_utils/helpers";
import { Polyline } from "react-leaflet";

export function SpeedTrack({ points }: { points: GpsLocation[] }) {
  return (
    <>
      {points.map((pt, i) => {
        if (i === 0) return null;
        const prev = points[i - 1];
        const avgSpeed = (pt.speed + prev.speed) / 2;
        return (
          <Polyline
            key={`seg-${pt.time}`}
            positions={[
              [prev.latitude, prev.longitude],
              [pt.latitude, pt.longitude],
            ]}
            color={speedToColor(avgSpeed)}
            weight={3.5}
            opacity={0.88}
          />
        );
      })}
    </>
  );
}
