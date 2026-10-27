import { supabaseServer } from "@/_lib/supabase/server";
import { buildZip } from "@/_lib/export/buildZip";
import { ExportFilters } from "@/_types/export";

// NB: This background job runs as fire-and-forget promise.
// If server restarts mid-export, the job will be lost and the row will remain stuck in 'processing'.
// We should consider moving to a proper job queue for retries in the future.

export async function runExportJob( role: 'admin' | 'fisher' | 'analyst', jobId: string, filters: ExportFilters) {
  const tag = `[${role}/runExportJob] jobId: ${jobId}`;

  try {
    const { error: processingError } = await supabaseServer
      .from("download_jobs")
      .update({
        status: "processing",
        processing_started_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (processingError) {
      console.error(`${tag} Failed to update status to processing:`, processingError);
    }

    const { outputPath, sizeBytes, failureCount } = await buildZip(jobId, filters);

    const { error: completeError } = await supabaseServer
      .from("download_jobs")
      .update({
        status: "complete",
        output_path: outputPath,
        output_size_bytes: sizeBytes,
        failure_count: failureCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (completeError) {
      console.error(`${tag} Failed to update status to complete:`, completeError);
    }

  } catch (err) {
    console.error(`${tag} Caught error:`, err);
    await supabaseServer
      .from("download_jobs")
      .update({
        status: "failed",
        error_message: String(err),
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  }
}
