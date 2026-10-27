import { supabaseServer } from "../supabase/server";

type CreateExportJobParams = {
  requestedBy: string;
  requesterRole: 'admin' | 'fisher' | 'analyst';
  anonymised: boolean;
  filterStart: string;
  filterEnd: string;
  vesselIds: number[] | null;
  includes: {
    alerts: boolean;
    bycatch: boolean;
    audio: boolean;
    video: boolean;
    transcripts: boolean;
    gps: boolean;
  };
};

export async function createExportJob(params: CreateExportJobParams) {
  // Check there are no ongoing exports in the last 5 minutes
  // Avoids blocking new exports due to stuck jobs
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data: activeJob } = await supabaseServer
    .from("download_jobs")
    .select("id")
    .in("status", ["pending", "processing"])
    .eq("requested_by", params.requestedBy)
    .gte("created_at", fiveMinutesAgo)
    .maybeSingle();

  if (activeJob) return { conflict: true } as const;

  const { data: job, error } = await supabaseServer
    .from("download_jobs")
    .insert({
      requested_by: params.requestedBy,
      requester_role: params.requesterRole,
      status: "pending",
      filter_start: params.filterStart,
      filter_end: params.filterEnd,
      filter_vessel_ids: params.vesselIds,
      include_alerts:      params.includes.alerts,
      include_bycatch:     params.includes.bycatch,
      include_audio:       params.includes.audio,
      include_video:       params.includes.video,
      include_transcripts: params.includes.transcripts,
      include_gps:         params.includes.gps,
      anonymised: params.anonymised,
    })
    .select("id")
    .single();

  if (error || !job) return { dbError: true } as const;

  return { jobId: job.id } as const;
}
