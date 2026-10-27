'use client';

import { timelineTooltipClasses } from "@/_styles/tooltip";
import { Badge } from "./badge";
import { AlertPoint, BycatchPoint } from "@/_types/data-points";
import { FileText, Clapperboard, Headphones } from "lucide-react";
import { capitaliseAndSpace, formatTimestampIntoTime } from "@/_utils/formatting";

interface TooltipProps {
  data: BycatchPoint | AlertPoint;
}

export const AlertTooltip = ({ data }: TooltipProps) => {
  const fileTypes = [
    { key: 'videoFileIds', label: 'Video', Icon: Clapperboard },
    { key: 'audioFileIds', label: 'Audio', Icon: Headphones },
    { key: 'transcriptFileIds', label: 'Transcript', Icon: FileText },
  ] as const;

  const isBycatch = data.type === "bycatch";

  return (
    <div className={`w-74 ${timelineTooltipClasses}`} data-testid={`${isBycatch ? "bycatch" : "alert"}-tooltip`}>

      <div className="flex items-center justify-between">
        <p>{data.name}</p>
        <Badge variant={ isBycatch ? "destructive" : "alert" }>
          { isBycatch ? "Bycatch Detected" : "Alert" }
        </Badge>
      </div>

      <div className="text-xs space-y-1">
        {isBycatch && Array.isArray(data.speciesDetected) && data.speciesDetected.length > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Species Detected:</span>
            <span>{capitaliseAndSpace(data.speciesDetected.join(", "))}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-muted-foreground">Time:</span>
          <span>{formatTimestampIntoTime(data.time)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Available Media:</span>
          { !fileTypes.some(({ key }) => data[key]?.length) ? (
            <span>None</span>
          ) : (
            <div className="flex flex-wrap gap-2 pt-2">
              {fileTypes.map(({ key, label, Icon }) =>
                data[key]?.length ? (
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

      <p className="border-t pt-2 text-xs text-muted-foreground">
        Click on the corresponding row in the table below to view associated media.
      </p>

    </div>
  )
};
