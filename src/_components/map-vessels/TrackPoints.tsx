import { speedToColor } from "@/_utils/helpers";
import { CircleMarker, Tooltip } from "react-leaflet";
import { GpsTooltip } from "../map-alerts/TooltipGps";
import { GpsLocation } from "@/_types/gps_location";

export function TrackPoints({ visiblePoints }: { visiblePoints: GpsLocation[] }) {
  return (
    <>
      {visiblePoints.map((pt) => (
        <CircleMarker
          key={`pt-${pt.time}`}
          center={[pt.latitude, pt.longitude]}
          radius={3.5}
          fillColor={speedToColor(pt.speed)}
          color="#fff"
          weight={1}
          fillOpacity={0.85}
        >
          <Tooltip direction="top" offset={[0, -6]} opacity={1} className="!bg-transparent !border-0 !shadow-none !p-0">
            <GpsTooltip data={pt} />
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  )
}
