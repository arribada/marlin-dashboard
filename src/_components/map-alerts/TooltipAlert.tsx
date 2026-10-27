import { mapAlertTooltipClasses } from "@/_styles/tooltip";
import { Alert } from "@/_types/alert";
import { formatLat, formatLon, formatTimeThenDate } from "@/_utils/formatting";
import { Badge } from "../ui/badge";
import { fileTypes } from "@/_lib/constants";

interface TooltipProps {
  alert: Alert;
}

export const AlertTooltip = ({ alert }: TooltipProps) => {
  const isBycatch = alert.type === "bycatch";

  const rows: [string, React.ReactNode][] = [
    ["Time:", alert.time != null ? formatTimeThenDate(alert.time) : "—"],
    ["Lat:", Number.isFinite(alert.latitude) ? formatLat(alert.latitude) : "—"],
    ["Lon:", Number.isFinite(alert.longitude) ? formatLon(alert.longitude) : "—"],
  ];

  const hasMedia = fileTypes.some(({ key }) => alert[key]?.length);

  return (
    <div className={mapAlertTooltipClasses} data-testid="map-alert-tooltip">

      <div className="border-b p-4 flex items-center justify-between">
        <p>{alert.name}</p>
        <Badge variant={ isBycatch ? "destructive" : "alert" }>
          { isBycatch ? "Bycatch Detected" : "Alert" }
        </Badge>
      </div>

      <div className="text-sm space-y-1 p-4 pt-0">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span>{value}</span>
          </div>
        ))}

        <div className="flex justify-between">
          <span className="text-muted-foreground">Available Media:</span>
          {!hasMedia ? (
            <span className="text-right">None</span>
          ) : (
            <div className="flex flex-wrap gap-2 pt-2">
              {fileTypes.map(({ key, label, Icon }) =>
                alert[key]?.length ? (
                  <Badge key={key}>
                    <Icon className="h-3 w-3 mr-1" />
                    {label}
                  </Badge>
                ) : null
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
