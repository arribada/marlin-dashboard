import { supabaseServer } from "@/_lib/supabase/server";
import { AdminAlert } from "@/_types/alert";
import { AdminGps } from "@/_types/gps_location";
import { MediaFile, TranscriptFile } from "@/_types/file";
import { ExportData, ExportFilters } from "@/_types/export";

export function mapAlert(row: any, type: "alert" | "bycatch"): AdminAlert {
  return {
    id: row.id,
    name: row.name,
    type,
    vesselId: row.vessel_id,
    time: row.time,
    latitude: row.latitude,
    longitude: row.longitude,
    speciesDetected: row.species_detected ?? [],
    audioFileIds: row.audio_file_ids ?? [],
    videoFileIds: row.video_file_ids ?? [],
    transcriptFileIds: row.transcript_file_ids ?? [],
  };
}

export function mapMediaFile(f: any): MediaFile {
  return {
    id: f.id,
    name: f.name,
    type: f.type,
    start: f.start,
    filepath: f.file_path,
    share_name: f.share_name,
    vessel_id: f.vessel_id,
  };
}

export function mapTranscriptFile(f: any): TranscriptFile {
  return {
    id: f.id,
    name: f.name,
    type: f.type,
    start: f.start,
    vessel_id: f.vessel_id,
    transcript_content: f.transcript_content,
  };
}

export function mapGps(row: any): AdminGps {
  return {
    vesselId: row.vessel_id,
    tripName: row.trip_name ?? null,
    time: row.time,
    latitude: row.latitude,
    longitude: row.longitude,
    speed: row.speed,
    course: row.course,
  };
}


// This function fetches all the data needed for an export based on the provided filters.
// It returns raw data mapped to our internal types, but does not do any formatting (e.g. CSV building) or file streaming.
export async function fetchExportData(filters: ExportFilters): Promise<ExportData> {
  const {
    filterStart,
    filterEnd,
    vesselIds,
    includeAlerts,
    includeBycatch,
    includeAudio,
    includeVideo,
    includeTranscripts,
    includeGps,
  } = filters;

  // Applies vessel filter when IDs are provided; omits it for fleet-wide queries (analysts)
  const applyVesselFilter = (query: any) =>
    vesselIds ? query.in("vessel_id", vesselIds) : query;

  const [alertsResult, filesResult, gpsResult] = await Promise.all([
    // Alerts & bycatch come from the same table
    includeAlerts || includeBycatch
      ? applyVesselFilter(supabaseServer
          .from("alerts")
          .select(`
            id,
            name,
            vessel_id,
            start,
            end,
            latitude,
            longitude,
            species_detected,
            audio_file_ids,
            video_file_ids,
            transcript_file_ids
          `)
          .gte("start", filterStart)
          .lte("start", filterEnd)
          ) : Promise.resolve({ data: [], error: null }),

    // Audio, video, transcripts all come from the files table
    includeAudio || includeVideo || includeTranscripts
      ? applyVesselFilter(supabaseServer
          .from("files")
          .select(`
            id,
            name,
            type,
            start,
            file_path,
            share_name,
            vessel_id,
            transcript_content
          `)
          .gte("start", filterStart)
          .lte("start", filterEnd)
          .in("type", [
            ...(includeAudio ? ["audio"] : []),
            ...(includeVideo ? ["video"] : []),
            ...(includeTranscripts ? ["transcript"] : []),
          ])
        ) : Promise.resolve({ data: [], error: null }),

    // GPS locations
    includeGps
      ? applyVesselFilter(supabaseServer
          .from("gps_locations")
          .select(`
            vessel_id,
            trip_name,
            time,
            latitude,
            longitude,
            speed,
            course
          `)
          .gte("time", filterStart)
          .lte("time", filterEnd)
          ) : Promise.resolve({ data: [], error: null }),
  ]);

  // Surface any Supabase errors early
  if (!alertsResult.data || !filesResult.data || !gpsResult.data) {
    throw new Error("Something went wrong fetching your data, please try again");
  }

  const allAlerts = (alertsResult.data ?? []) as any[];
  const allFiles = (filesResult.data ?? []) as any[];
  const allGps = (gpsResult.data ?? []) as any[];

  allFiles.forEach((f) => {
    if (!f.vessel_id) {
      console.warn(`[fetchExportData] File ${f.id} has no vessel_id — will appear under vessel-unknown in ZIP`);
    }
  });

  // Map alerts rows to AdminAlert type
  const mappedAlerts = allAlerts.filter(r => !r.species_detected?.length).map(r => mapAlert(r, "alert"));
  // Bycatch = alerts where species_detected is populated
  const mappedBycatch = allAlerts.filter(r => r.species_detected?.length > 0).map(r => mapAlert(r, "bycatch"));
  // Map files rows to MediaFile type
  const audioFiles = allFiles.filter(f => f.type === "audio").map(mapMediaFile);
  const videoFiles = allFiles.filter(f => f.type === "video").map(mapMediaFile);
  // Map files rows to TranscriptFile type
  const transcriptFiles = allFiles.filter(f => f.type === "transcript").map(mapTranscriptFile);
  // Map GPS rows to AdminGps type
  const mappedGps = allGps.map(mapGps);

  return {
    alerts: includeAlerts ? mappedAlerts : [],
    bycatch: includeBycatch ? mappedBycatch : [],
    audioFiles,
    videoFiles,
    transcriptFiles,
    gps: mappedGps,
  };
}
