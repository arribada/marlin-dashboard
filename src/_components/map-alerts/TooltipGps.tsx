import { gpsTooltipClasses } from "@/_styles/tooltip";
import { GpsLocation } from "@/_types/gps_location";
import { formatLat, formatLon, formatTimestampIntoTime } from "@/_utils/formatting";

interface TooltipProps {
  data: GpsLocation;
}

export const GpsTooltip = ({ data }: TooltipProps) => {
  const rows: [string, React.ReactNode][] = [
    ["Speed:", data.speed != null ? `${data.speed} kts` : "—"],
    ["Time:", data.time != null ? formatTimestampIntoTime(data.time) : "—"],
    ["Course:", data.course != null ? `${data.course}°` : "—"],
    ["Lat:", Number.isFinite(data.latitude) ? formatLat(data.latitude) : "—"],
    ["Lon:", Number.isFinite(data.longitude) ? formatLon(data.longitude) : "—"],
  ];

  return (
    <div className={gpsTooltipClasses} data-testid="speed-tooltip">
      <div className="border-b p-4 pb-2">GPS Point</div>
      <div className="space-y-1 p-4 pt-0">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
