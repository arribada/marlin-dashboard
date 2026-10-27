import { NextRequest } from "next/server";
import { toCamelCase } from "@/_utils/formatting";
import { parseFileIds, requireAdmin } from "@/_lib/api/route-helpers";
import { fetchDB } from "@/_lib/database/client";

export async function GET(req: NextRequest) {
  const result = await requireAdmin(req, "admin/transcripts API");
  if (!result.ok) return result.response;

  const fileIds = parseFileIds(req, "admin/transcripts API");
  if (fileIds instanceof Response) return fileIds;

  try {
    const data = await fetchDB("/admin/transcripts", { file_ids: fileIds });
    return Response.json(toCamelCase(data.admin_transcripts) ?? []);
  } catch (error) {
    console.error("[admin/transcripts API] DB request error:", error);
    return Response.json({ error: "Failed to fetch map data" }, { status: 500 });
  }
}
