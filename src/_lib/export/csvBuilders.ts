import { AdminAlert } from "@/_types/alert";
import { AdminGps } from "@/_types/gps_location";
import { escapeCell, joinArrayField } from "@/_utils/formatting";

function buildCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers, ...rows].map((row) =>
    row.map(escapeCell).join(",")
  );
  return lines.join("\r\n");
}

export function buildAlertsCsv(alerts: AdminAlert[], anonymised = true): string {
  const headers = [
    "id", "name",
    ...(!anonymised ? ["vessel_id"] : []),
    "time",
    "latitude", "longitude", "species_detected",
    "audio_file_ids", "video_file_ids", "transcript_file_ids"
  ];
  const rows = alerts.map((a) => [
    a.id,
    a.name,
    ...(!anonymised ? [a.vesselId] : []),
    a.time,
    a.latitude,
    a.longitude,
    joinArrayField(a.speciesDetected),
    joinArrayField(a.audioFileIds),
    joinArrayField(a.videoFileIds),
    joinArrayField(a.transcriptFileIds),
  ]);
  return buildCsv(headers, rows);
}

export function buildGpsCsv(gps: AdminGps[], anonymised = true): string {
  const headers = [...(!anonymised ? ["vessel_id"] : []), "trip_name", "time", "latitude", "longitude", "speed", "course"];
  const rows = gps.map((g) => [
    ...(!anonymised ? [g.vesselId] : []),
    g.tripName,
    g.time,
    g.latitude,
    g.longitude,
    g.speed,
    g.course,
  ]);
  return buildCsv(headers, rows);
}
