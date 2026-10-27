"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Calendar, Download, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { VesselMinimal } from "@/_types/vessel";
import { dataTypes } from "@/_lib/constants";
import { DateTimeField } from "./date-time-field";
import { ExportStatusPanel } from "./export-status-panel";
import { useExportJob } from "@/_hooks/useExportJob";
import { ExportSummaryCard } from "./export-summary-card";
import { DateRange } from "@/_types/export";
import { DataTypeField } from "./data-type-field";
import { VesselsMultiselectField } from "./vessels-multiselect-field";

type FormProps = {
  vessels: VesselMinimal[] | null;
  role: 'admin' | 'fisher' | 'analyst';
}

export function Form({ vessels, role }: FormProps) {

  // --- State ---
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [dateRange, setDateRange] = useState({
    startDate: sevenDaysAgo.toISOString().split("T")[0], startTime: "00:00",
    endDate: today.toISOString().split("T")[0],          endTime: "23:59",
  });

  const [selectedVessels, setSelectedVessels] = useState<number[]>([]);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<string>("");

  const excludedDataTypeIds = role === 'analyst' ? ['video', 'audio', 'transcript'] : [];
  const availableDataTypes = dataTypes.filter(dt => !excludedDataTypeIds.includes(dt.id));

  // --- External hook ---
  const {
    exportStatus,
    fileSizeBytes,
    errorMessage,
    failureCount,
    downloadLinkRef,
    handleSubmit,
    handleRetry,
    handleNewExport,
  } = useExportJob(role);

  // --- Validation ---
  const filters = { dateRange, selectedVessels, selectedDataTypes };
  const [submittedFilters, setSubmittedFilters] = useState<{
    dateRange: DateRange;
    vesselNames: string[];
    dataTypeLabels: string[];
  } | null>(null);

  const dateRangeError = useMemo(() => {
    const start = new Date(`${dateRange.startDate}T${dateRange.startTime}`);
    const end = new Date(`${dateRange.endDate}T${dateRange.endTime}`);
    if (end <= start) return "End date must be after start date";
    return null;
  }, [dateRange]);

  const dateRangeWarning = useMemo(() => {
    const start = new Date(`${dateRange.startDate}T${dateRange.startTime}`);
    const end = new Date(`${dateRange.endDate}T${dateRange.endTime}`);
    const days = (end.getTime() - start.getTime()) / 86_400_000;
    if (days > 31) return "Large date ranges may take several minutes to process";
    return null;
  }, [dateRange]);

  const isFormValid =
    !dateRangeError &&
    (role !== 'admin' || selectedVessels.length > 0) &&
    selectedDataTypes.length > 0;

  // --- Handlers ---
  const updateDateRange = (field: keyof typeof dateRange) => (value: string) =>
    setDateRange(prev => ({ ...prev, [field]: value }));

  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setDateRange(prev => ({
      ...prev,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }));
  };

  const toggleVessel = (id: number) =>
    setSelectedVessels(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );

  const handleDataTypeChange = (newType: string) => {
    const newSelectedTypes = selectedDataTypes.includes(newType)
      ? selectedDataTypes.filter(dt => dt !== newType)
      : [...selectedDataTypes, newType];

    setSelectedDataTypes(newSelectedTypes);

    if (newSelectedTypes.length > 1) {
      setExportFormat("zip");
    } else if (newSelectedTypes.length === 1) {
      const dataType = dataTypes.find(dt => dt.id === newSelectedTypes[0]);
      if (dataType) setExportFormat(dataType.formats[0]);
    } else {
      setExportFormat("");
    }
  };

  const isProcessing = exportStatus === "pending" || exportStatus === "processing";

  return (
    <div data-testid="export-form" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Configuration Form */}
        <div className="lg:col-span-2">
          <Card className="gap-0">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-ocean-blue">Export Configuration</h3>
                {isProcessing && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Export in progress
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Configure parameters for your data export
              </p>
            </CardHeader>

            <CardContent className="p-6 space-y-6 relative" inert={isProcessing}>
              {isProcessing && (
                <div className="absolute inset-0 bg-background/50 rounded-lg z-10" />
              )}

              <div className="space-y-3 pb-6 border-b">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    <Calendar className="h-4 w-4 text-ocean-blue" />
                    Date & Time Range
                  </span>
                  <div className="flex gap-3">
                    {[7, 14, 30].map((days) => (
                      <Button key={days} variant="outline" onClick={() => handleQuickRange(days)}>
                        {days} days
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <DateTimeField label="Start Date" id="start-date" type="date" value={dateRange.startDate} onChange={updateDateRange("startDate")} />
                  <DateTimeField label="Start Time" id="start-time" type="time" value={dateRange.startTime} onChange={updateDateRange("startTime")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <DateTimeField label="End Date" id="end-date" type="date" value={dateRange.endDate} onChange={updateDateRange("endDate")} />
                  <DateTimeField label="End Time" id="end-time" type="time" value={dateRange.endTime} onChange={updateDateRange("endTime")} />
                </div>
                {dateRangeError && <p className="text-destructive" data-testid="date-range-error">{dateRangeError}</p>}
                {dateRangeWarning && <p className="text-destructive" data-testid="date-range-warning">{dateRangeWarning}</p>}
              </div>

              {role === 'admin'  && vessels &&  (
                <VesselsMultiselectField
                  vessels={vessels}
                  selectedVessels={selectedVessels}
                  onToggle={toggleVessel}
                />
              )}

              <DataTypeField
                dataTypes={availableDataTypes}
                selectedDataTypes={selectedDataTypes}
                onChange={handleDataTypeChange}
              />
            </CardContent>
          </Card>
        </div>

        {/* Hidden anchor for programmatic download */}
        <a ref={downloadLinkRef} className="hidden" download />

        {/* Right Column */}
        <div className="space-y-6">
          {exportStatus && submittedFilters ? (
            <ExportStatusPanel
              status={exportStatus}
              fileSizeBytes={fileSizeBytes}
              errorMessage={errorMessage}
              failureCount={failureCount}
              dateRange={submittedFilters.dateRange}
              vesselNames={submittedFilters.vesselNames}
              dataTypeLabels={submittedFilters.dataTypeLabels}
              isProcessing={isProcessing}
              onNewExport={() => {
                setSubmittedFilters(null);
                handleNewExport();
              }}
              onRetry={() => handleRetry(filters)}
            />
          ) : (
            <>
              <ExportSummaryCard
                dateRange={dateRange}
                selectedVessels={selectedVessels}
                selectedDataTypes={selectedDataTypes}
                exportFormat={exportFormat}
              />

              <Button
                className="w-full h-12"
                disabled={!isFormValid}
                onClick={() => {
                  setSubmittedFilters({
                    dateRange,
                    vesselNames: vessels
                      ? selectedVessels.map(id => vessels.find(v => v.id === id)?.name ?? `Vessel Unknown`)
                      : [],
                    dataTypeLabels: selectedDataTypes.map(dt => dataTypes.find(d => d.id === dt)?.label ?? dt),
                  });
                  handleSubmit(filters);
                }}
                data-testid="generate-button"
              >
                <Download className="h-5 w-5 mr-2" />
                Generate Export
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                A download link will be generated.
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
