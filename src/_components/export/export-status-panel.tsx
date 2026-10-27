"use client";

import { Loader2, CheckCircle2, XCircle, Download } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/_components/ui/card";
import { Button } from "@/_components/ui/button";
import { Badge } from "@/_components/ui/badge";
import { labelClass } from "@/_styles/text";
import { formatBytes, formatDateThenTime } from "@/_utils/formatting";
import { ExportStatus } from "@/_types/export";
import { EXPORT_STATUS_LABELS } from "@/_lib/constants";

export interface ExportStatusPanelProps {
  status: ExportStatus;
  fileSizeBytes: number | null;
  errorMessage: string | null;
  failureCount: number;
  dateRange: {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
  };
  vesselNames?: string[];
  isProcessing: boolean;
  dataTypeLabels: string[];
  onNewExport: () => void;
  onRetry: () => void;
}

export function ExportStatusPanel({
  status,
  fileSizeBytes,
  errorMessage,
  failureCount,
  dateRange,
  vesselNames,
  isProcessing,
  dataTypeLabels,
  onNewExport,
  onRetry,
}: ExportStatusPanelProps) {
  const isComplete = status === "complete";
  const isFailed = status === "failed";
  const statusLabel = EXPORT_STATUS_LABELS[status];
  const formattedStart = formatDateThenTime(`${dateRange.startDate}T${dateRange.startTime}`);
  const formattedEnd = formatDateThenTime(`${dateRange.endDate}T${dateRange.endTime}`);

  return (
    <Card className="bg-muted/50 gap-0">
      <CardHeader className="border-b border-ocean-blue/20">
        <div className="flex items-center gap-2">

          { isProcessing && <Loader2 className="h-4 w-4 text-ocean-blue animate-spin" /> }
          { isComplete && <CheckCircle2 className="h-4 w-4 text-green-500" /> }
          { isFailed && <XCircle className="h-4 w-4 text-destructive" /> }

          <h3 className="text-ocean-blue" data-testid="status-label">{statusLabel}</h3>
        </div>

        {isFailed && errorMessage && (
          <p className="text-sm text-destructive" data-testid="error-message">{errorMessage}</p>
        )}

        {isProcessing && (
          <p className="text-muted-foreground mt-1" data-testid="processing-subtitle">
            This may take a few minutes for large exports
          </p>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Job details — always visible */}
        <div className="space-y-3">
          <div>
            <p className={labelClass}>Date range</p>
            <p>{formattedStart}</p>
            <p className="text-muted-foreground">to</p>
            <p>{formattedEnd}</p>
          </div>

          {vesselNames && vesselNames.length > 0 && (
            <div>
              <p className={labelClass}>Vessels</p>
              <div className="flex flex-wrap gap-1">
                {vesselNames.map((name) => (
                  <Badge key={name} className="text-xs">{name}</Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className={labelClass}>Data types</p>
            <div className="flex flex-wrap gap-1">
              {dataTypeLabels.map((label) => (
                <Badge key={label} className="text-xs">{label}</Badge>
              ))}
            </div>
          </div>

          {isComplete && fileSizeBytes && (
            <div>
              <p className={labelClass}>File size</p>
              <p data-testid="file-size">{formatBytes(fileSizeBytes)}</p>
            </div>
          )}

          {isComplete && failureCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3" data-testid="failure-warning">
              <p className="text-amber-900 dark:text-amber-200">
                <strong>{failureCount} file{failureCount !== 1 ? "s" : ""} could not be retrieved</strong>{" "}
                and are missing from your export. Check ERRORS.txt inside the ZIP for details.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {isComplete &&
          <Button className="w-full" onClick={onNewExport} data-testid="new-export-button">
            New export
          </Button>
        }

        {isFailed &&
          <Button variant="destructive" className="w-full mt-2" onClick={onRetry} data-testid="retry-button">
            Try again
          </Button>
        }
      </CardContent>
    </Card>
  );
}
