import { ExportStatus } from "@/_types/export";
import { Clapperboard, FileText, Headphones } from "lucide-react";

export const FILTER_START_DATE = new Date("2025-01-01T00:00:00");

export const dataTypes = [
  { id: "alerts", label: "Alert data", formats: ["csv"] },
  { id: "bycatch", label: "Bycatch data", formats: ["csv"] },
  { id: "audio", label: "Audio logs", formats: ["wav"] },
  { id: "video", label: "Video footage", formats: ["mp4"] },
  { id: "transcript", label: "Transcript data", formats: ["txt"] },
  { id: "gps", label: "GPS coordinates", formats: ["csv"] },
];

export const EXPORT_STATUS_LABELS: Record<ExportStatus, string> = {
  pending: "Queued...",
  processing: "Building export...",
  complete: "Export ready",
  failed: "Export failed",
  expired: "Export expired"
};

export const ICES_DIVISIONS_URL =
  'https://gis.ices.dk/geoserver/ices_eg/ows' +
  '?service=WFS&version=1.0.0&request=GetFeature' +
  '&typeName=ices_eg:ICES_AREAS_VISA_SIMPLE_5KM' +
  '&outputFormat=application/json' +
  '&bbox=-12,49,4,62,EPSG:4326';

export const TIMELINE_CONFIG = {
  /** Debounce (ms) before refetching GPS after a zoom/pan change stops moving. */
  FETCH_DEBOUNCE_MS: 400,
  /** Maximum zoom multiplier (ZoomPanControls doubles from 1 up to this). */
  MAX_ZOOM_LEVEL: 100,
  MIN_ZOOM_LEVEL: 1,
  /** Percentage points moved per pan-left/pan-right click. */
  PAN_STEP_PERCENT: 10,
} as const;

export const fileTypes = [
  { key: 'videoFileIds', label: 'Video', Icon: Clapperboard },
  { key: 'audioFileIds', label: 'Audio', Icon: Headphones },
  { key: 'transcriptFileIds', label: 'Transcript', Icon: FileText },
] as const;
