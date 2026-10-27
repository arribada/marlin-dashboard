import { NextResponse } from "next/server";
import { supabaseServer } from "@/_lib/supabase/server";
import { statSync, createReadStream, unlinkSync } from "fs";
import { basename } from "path";

export async function downloadExportJob(jobId: string, userId: string, tag: string) {
  // Fetch job and verify ownership
  const { data: job, error } = await supabaseServer
    .from("download_jobs")
    .select("id, status, output_path, requested_by")
    .eq("id", jobId)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: `[${tag}] Job not found` }, { status: 404 });
  }

  if (job.requested_by !== userId) {
    return NextResponse.json({ error: `[${tag}] Forbidden` }, { status: 403 });
  }

  if (job.status !== "complete") {
    return NextResponse.json({ error: `[${tag}] Export not ready` }, { status: 400 });
  }

  if (!job.output_path) {
    return NextResponse.json({ error: `[${tag}] Output path missing` }, { status: 500 });
  }

  let fileStat;
  try {
    fileStat = statSync(job.output_path);
  } catch {
    console.error(`${tag} File not found on disk: ${job.output_path}`);
    return NextResponse.json({ error: `[${tag}] Export file not found` }, { status: 404 });
  }

  const filename = basename(job.output_path);
  const fileStream = createReadStream(job.output_path);
  // Stream the file to the browser
  const response = new NextResponse(fileStream as unknown as ReadableStream, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(fileStat.size),
    },
  });
  // Delete the file from disk after streaming
  fileStream.on("close", () => {
    try {
      unlinkSync(job.output_path);
      console.log(`[${tag}] Deleted export file: ${job.output_path}`);

      Promise.resolve(
        supabaseServer
          .from("download_jobs")
          .update({ status: "expired" })
          .eq("id", job.id)
      )
        .then(() => console.log(`[${tag}] Marked job ${job.id} as expired`))
        .catch((err) => console.error(`[${tag}] Failed to mark job ${job.id} as expired`, err));
    } catch (err) {
      console.error(`[${tag}] Failed to delete export file: ${job.output_path}`, err);
    }
  });

  return response;
}
