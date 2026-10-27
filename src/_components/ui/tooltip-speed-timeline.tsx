'use client';

import { timelineTooltipClasses } from "@/_styles/tooltip";
import { SpeedPoint } from "@/_types/data-points";
import { formatTimestampIntoTime } from "@/_utils/formatting";

interface TooltipProps {
  data: SpeedPoint;
}

export const SpeedTooltip = ({ data }: TooltipProps) => {
  return (
    <div className={`w-32 ${timelineTooltipClasses}`} data-testid="speed-tooltip">
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Speed:</span>
          <span>{data.speed} kts</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Time:</span>
          <span>{formatTimestampIntoTime(data.time)}</span>
        </div>
      </div>
    </div>
  );
};
