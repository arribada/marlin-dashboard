import archiver from "archiver";
import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { fetchExportData } from "../supabase/fetchExportData";
import { ExportFilters } from "@/_types/export";
import validateEnvVar from "@/_utils/validateEnvVar";
import { getAzureFileStream } from "./getAzureFileStream";
import { buildAlertsCsv, buildGpsCsv } from "./csvBuilders";

// NOTE: This utility builds ZIPs synchronously within the Next.js process.
// This works for moderate export sizes but has no retry mechanism — if the
// server restarts mid-build the job will stall in 'processing'.
// Future improvement: move to a proper job queue (e.g. BullMQ + Redis)

const EXPORT_PATH = validateEnvVar("EXPORT_STORAGE_PATH", "string");

export async function buildZip(jobId: string, filters: ExportFilters): Promise<{ outputPath: string; sizeBytes: number; failureCount: number }> {
  const tag = "[export/buildZip]";

  mkdirSync(EXPORT_PATH, { recursive: true });

  const outputPath = join(EXPORT_PATH, `export-${jobId}.zip`);
  const output = createWriteStream(outputPath);

  // Track failed files throughout the build so we can surface them at the end
  const failures: { type: string; fileName: string; filepath: string; reason: string }[] = [];

  // level 6 is a good compromise between compression & speed for our use case
  const archive = archiver("zip", { zlib: { level: 6 } });

  const data = await fetchExportData(filters);

  const hasData = data.alerts.length > 0 || data.bycatch.length > 0 ||
      data.gps.length > 0 || data.transcriptFiles.length > 0 ||
      data.audioFiles.length > 0 || data.videoFiles.length > 0;
  if (!hasData) {
    throw new Error("No data found for the selected filters");
  }

  const waitForClose = new Promise<void>((resolve, reject) => {
    output.on("close", () => {
      resolve();
    });
    archive.on("error", (err) => {
      if (failures.length > 0) {
        resolve();
      } else {
        reject(err);
      }
    });
  });

  archive.pipe(output);

  // --- Tabular CSVs (all vessels in one file each) ---
  if (filters.includeAlerts && data.alerts.length > 0) {
    archive.append(buildAlertsCsv(data.alerts, filters.anonymised), { name: "alerts.csv" });
  }

  if (filters.includeBycatch && data.bycatch.length > 0) {
    archive.append(buildAlertsCsv(data.bycatch, filters.anonymised), { name: "bycatch.csv" });
  }

  if (filters.includeGps && data.gps.length > 0) {
    archive.append(buildGpsCsv(data.gps, filters.anonymised), { name: "gps.csv" });
  }

  // --- Transcripts (stored as text files in vessel-specific folders) ---
  if (filters.includeTranscripts) {
    for (const file of data.transcriptFiles) {
      const vesselFolder = `vessels/vessel-${file.vessel_id}/transcripts`;
      const filename = `${file.name}.txt`;
      archive.append(file.transcript_content, {
        name: `${vesselFolder}/${filename}`,
      });
    }
  }

  // --- Media files (streamed from Azure, in vessel-specific folders) ---
  let pendingStreams = 0;

  if (filters.includeAudio) {
    for (const file of data.audioFiles) {
      try {
        const stream = await getAzureFileStream(file.share_name, file.filepath);

        pendingStreams++;

        stream.on('error', (err) => {
          failures.push({ type: "audio", fileName: file.name, filepath: file.filepath, reason: String(err) });
          stream.destroy();
          stream.emit('end');
          pendingStreams--;
        });
        stream.on('end', () => pendingStreams--);

        const vesselFolder = `vessels/vessel-${file.vessel_id}/audio`;
        archive.append(stream, { name: `${vesselFolder}/${file.name}` });
      } catch (err) {
        console.error(`${tag} Failed to stream audio file ${file.id}:`, err);
        failures.push({ type: "audio", fileName: file.name, filepath: file.filepath, reason: String(err) });
      }
    }
  }

  if (filters.includeVideo) {
    for (const file of data.videoFiles) {
      try {
        const stream = await getAzureFileStream(file.share_name, file.filepath);

        pendingStreams++;

        stream.on('error', (err) => {
          failures.push({ type: "video", fileName: file.name, filepath: file.filepath, reason: String(err) });
          stream.destroy();
          stream.emit('end');
          pendingStreams--;
        });
        stream.on('end', () => pendingStreams--);

        const vesselFolder = `vessels/vessel-${file.vessel_id}/video`;
        archive.append(stream, { name: `${vesselFolder}/${file.name}` });
      } catch (err) {
        console.error(`${tag} Failed to stream video file ${file.id}:`, err);
        failures.push({ type: "video", fileName: file.name, filepath: file.filepath, reason: String(err) });
      }
    }
  }

  // Ensure all stream error handlers have fired before finalizing,
  // otherwise failures[] may be incomplete when ERRORS.txt is written.
  await new Promise<void>(resolve => {
    const check = () => pendingStreams <= 0 ? resolve() : setTimeout(check, 50);
    check();
  });

  // Any failed files are written into the ZIP so user knows what data is missing
  if (failures.length > 0) {
    const lines = [
      "Export completed with errors",
      "============================",
      "The following files could not be retrieved:",
      "",
      ...failures.map(f =>
        `[${f.type.toUpperCase()}] (name: ${f.fileName})\n  Reason: ${f.reason}`
      ),
      "",
    ];
    archive.append(lines.join("\n"), { name: "ERRORS.txt" });
  }

  await archive.finalize();
  await waitForClose;

  return { outputPath, sizeBytes: archive.pointer(), failureCount: failures.length };
}
