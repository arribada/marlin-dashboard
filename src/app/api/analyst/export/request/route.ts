import { NextRequest, NextResponse } from "next/server";
import { ExportFilters } from "@/_types/export";
import { requireAnalyst } from "@/_lib/api/route-helpers";
import { createExportJob } from "@/_lib/export/createExportJob";
import { runExportJob } from "@/_lib/export/runExportJob";
import { parseDateRange } from "@/_utils/helpers";

export async function POST(req: NextRequest) {
  const tag = "POST /api/analyst/export/request";

  const auth = await requireAnalyst(req, tag);
  if (!auth.ok) return auth.response;
  const sub = auth.token.sub;
  if (typeof sub !== 'string') {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await req.json();
  const {
    filter_start,
    filter_end,
    include_alerts,
    include_bycatch,
    include_gps,
  } = body;

  const dateRange = parseDateRange(filter_start, filter_end);
  if (
    !filter_start ||
    !filter_end ||
    !dateRange.ok
  ) {
    return NextResponse.json({ error: `[${tag}] Invalid request fields` }, { status: 400 });
  }

  const result = await createExportJob({
    requestedBy: sub,
    requesterRole: 'analyst',
    anonymised: true,
    filterStart: filter_start,
    filterEnd: filter_end,
    vesselIds: null,
    includes: {
      alerts:      include_alerts ?? false,
      bycatch:     include_bycatch ?? false,
      audio:       false,
      video:       false,
      transcripts: false,
      gps:         include_gps ?? false,
    },
  });

  if ('conflict' in result) return NextResponse.json({ error: "An export is already in progress" }, { status: 429 });
  if ('dbError' in result) return NextResponse.json({ error: "Failed to create export job. Please try again." }, { status: 500 });

  // Map snake_case body to ExportFilters before passing to background job
  const filters: ExportFilters = {
    filterStart: filter_start,
    filterEnd: filter_end,
    includeAlerts: include_alerts ?? false,
    includeBycatch: include_bycatch ?? false,
    includeAudio: false,
    includeVideo: false,
    includeTranscripts: false,
    includeGps: include_gps ?? false,
    anonymised: true,
  };

  runExportJob('analyst', result.jobId, filters).catch((err) => {
    console.error(`[${tag}] Unhandled background job error for jobId ${result.jobId}:`, err);
  });

  return NextResponse.json({ jobId: result.jobId });
}
