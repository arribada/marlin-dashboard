import { requireAnalyst } from "@/_lib/api/route-helpers";
import { getExportJobStatus } from "@/_lib/export/getExportJobStatus";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const tag = "GET /api/analyst/export/status/[jobId]";

  const auth = await requireAnalyst(req, tag);
  if (!auth.ok) return auth.response;
  const sub = auth.token.sub;
  if (typeof sub !== 'string') {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { jobId } = await params;

  return getExportJobStatus(jobId, sub, tag);
}
