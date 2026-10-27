import { AdminAlert } from "./alert";
import { MediaFile, TranscriptFile } from "./file";
import { AdminGps } from "./gps_location";

export type ExportStatus = "pending" | "processing" | "complete" | "failed" | "expired";

export type DateRange = {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

export interface ExportFilters {
  filterStart: string;
  filterEnd: string;
  vesselIds?: number[];
  includeAlerts: boolean;
  includeBycatch: boolean;
  includeAudio: boolean;
  includeVideo: boolean;
  includeTranscripts: boolean;
  includeGps: boolean;
  anonymised: boolean;
}

export interface SubmitFilters {
  dateRange: DateRange;
  selectedVessels: number[];
  selectedDataTypes: string[];
}

export interface ExportData {
  alerts: AdminAlert[];
  bycatch: AdminAlert[];
  audioFiles: MediaFile[];
  videoFiles: MediaFile[];
  transcriptFiles: TranscriptFile[];
  gps: AdminGps[];
}

export interface ExportFailures {
  type: string;
  fileName: string;
  filepath: string;
  reason: string;
}
