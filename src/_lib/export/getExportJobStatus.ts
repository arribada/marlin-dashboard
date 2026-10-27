import { NextResponse } from "next/server";
import { supabaseServer } from "@/_lib/supabase/server";

export async function getExportJobStatus(jobId: string, userId: string, tag: string) {
  const { data: job, error } = await supabaseServer
    .from("download_jobs")
    .select("id, status, output_size_bytes, error_message, failure_count, created_at, processing_started_at, completed_at, requested_by")
    .eq("id", jobId)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: `[${tag}] Job not found` }, { status: 404 });
  }

  if (job.requested_by !== userId) {
    return NextResponse.json({ error: `[${tag}] Forbidden` }, { status: 403 });
  }

  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    fileSizeBytes: job.output_size_bytes ?? null,
    errorMessage: job.error_message ?? null,
    failureCount: job.failure_count ?? 0,
    createdAt: job.created_at,
    processingStartedAt: job.processing_started_at ?? null,
    completedAt: job.completed_at,
  });
}
