import { GpsLocation } from "@/_types/gps_location";
import { Marker } from "react-leaflet";
import { makeArrowIcon } from "./Icons";
import { hasValidCoordinates } from "@/_lib/map-vessels/hasValidCoordinates";

export function DirectionalArrows({ arrowPoints }: { arrowPoints: GpsLocation[] }) {
  const validPoints = arrowPoints.filter(hasValidCoordinates);
  return (
    <>
      {/* ── Directional arrows ── */}
      {validPoints.map((pt) => (
        <Marker
          key={`arrow-${pt.time}`}
          position={[pt.latitude, pt.longitude]}
          icon={makeArrowIcon(pt.course)}
          interactive={false}
        />
      ))}
    </>
  )
}
