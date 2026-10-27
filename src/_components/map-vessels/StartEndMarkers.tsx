import { GpsLocation } from "@/_types/gps_location";
import { Marker, Tooltip } from "react-leaflet";
import { makeStartIcon } from "./Icons";
import { formatTimeThenDate } from "@/_utils/formatting";

interface Props {
  startPt?: GpsLocation;
  endPt?: GpsLocation;
}

export function StartEndMarkers({ startPt, endPt }: Props) {
  return (
    <>
      {startPt && (
        <Marker position={[startPt.latitude, startPt.longitude]} icon={makeStartIcon()}>
          <Tooltip direction="right" offset={[16, 0]} permanent={false} opacity={1}>
            <span className="text-sm">Departure: {formatTimeThenDate(startPt.time)}</span>
          </Tooltip>
        </Marker>
      )}

      {/* {endPt && (
        <Marker position={[endPt.latitude, endPt.longitude]} icon={makeEndIcon()}>
          <Tooltip direction="right" offset={[16, 0]} permanent={false} opacity={1}>
            <span className="text-sm">Return: {formatTimeThenDate(endPt.time)}</span>
          </Tooltip>
        </Marker>
      )} */}
    </>
  );
}
