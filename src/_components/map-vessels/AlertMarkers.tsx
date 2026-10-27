
import { Marker, Tooltip } from "react-leaflet";
import { makeAlertIcon } from "./Icons";
import { AlertTooltip } from "../map-alerts/TooltipAlert";
import { Alert } from "@/_types/alert";
import { hasValidCoordinates } from "@/_lib/map-vessels/hasValidCoordinates";

export function AlertMarkers({ alerts }: { alerts: Alert[] }) {
  const validAlerts = alerts.filter(hasValidCoordinates);
  return (
    <>
      {validAlerts.map((alert) => (
        <Marker
          key={alert.time}
          position={[alert.latitude, alert.longitude]}
          icon={makeAlertIcon(alert.type)}
        >
          <Tooltip direction="top" offset={[0, -14]} opacity={1} className="!bg-transparent !border-0 !shadow-none !p-0">
            <AlertTooltip alert={alert} />
          </Tooltip>
        </Marker>
      ))}
    </>
  )
}
