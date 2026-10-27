"use client";

import { Card, CardContent, CardHeader } from "../ui/card";
import { dataTypes } from "@/_lib/constants";
import { SummaryRow } from "./summary-row";
import { calculateDays } from "@/_utils/helpers";
import { DateRange } from "@/_types/export";

export interface ExportSummaryCardProps {
  dateRange: DateRange;
  selectedVessels?: number[];
  selectedDataTypes: string[];
  exportFormat: string;
}

export function ExportSummaryCard({
  dateRange,
  selectedVessels,
  selectedDataTypes,
  exportFormat,
}: ExportSummaryCardProps) {
  const dataTypeLabels = selectedDataTypes.map(
    dt => dataTypes.find(d => d.id === dt)?.label ?? dt
  );

  const formattedStart = new Date(`${dateRange.startDate}T${dateRange.startTime}`)
    .toLocaleString("en-GB", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const formattedEnd = new Date(`${dateRange.endDate}T${dateRange.endTime}`)
    .toLocaleString("en-GB", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  return (
    <Card className="bg-muted/50 gap-0">
      <CardHeader className="border-b border-ocean-blue/20">
        <h3 className="text-ocean-blue" data-testid="summary-heading">Export Summary</h3>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          <SummaryRow label="Date Range" value={`${calculateDays(dateRange)} days`} />
          { selectedVessels && selectedVessels.length > 0 && (
            <SummaryRow
              label="Vessels"
              value={`${selectedVessels.length} selected`}
              variant={selectedVessels.length === 0 ? "destructive" : "default"}
            />
          )}
          <SummaryRow label="Data Types" values={dataTypeLabels} />
          <SummaryRow label="Format" value={exportFormat?.toUpperCase()} />
        </div>
        <div className="space-y-3">
          <p className="text-muted-foreground">Date Range</p>
          <p className="text-sm" data-testid="formatted-start">{formattedStart}</p>
          <p className="text-muted-foreground">to</p>
          <p className="text-sm" data-testid="formatted-end">{formattedEnd}</p>
        </div>
        {selectedDataTypes.includes("video") && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3" data-testid="video-warning" >
            <p className="text-amber-900 dark:text-amber-200">
              <strong>Note:</strong> Video exports may take 10-20 minutes to process.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
