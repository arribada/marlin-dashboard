import { NextRequest, NextResponse } from "next/server";
import { requireFisher } from "@/_lib/api/route-helpers";
import { downloadExportJob } from "@/_lib/export/downloadExportJob";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const tag = "GET /api/fisher/export/download/[jobId]";

  const auth = await requireFisher(req, tag);
  if (!auth.ok) return auth.response;
  const sub = auth.token.sub;
  if (typeof sub !== 'string') {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { jobId } = await params;

  return downloadExportJob(jobId, sub, tag);
}
