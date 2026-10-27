import { NextRequest } from "next/server";
import { toCamelCase } from "@/_utils/formatting";
import { parseFileIds, requireAdmin } from "@/_lib/api/route-helpers";
import { fetchDB } from "@/_lib/database/client";

export async function GET(req: NextRequest) {
  const result = await requireAdmin(req, "admin/videos API");
  if (!result.ok) return result.response;

  const fileIds = parseFileIds(req, "admin/videos API");
  if (fileIds instanceof Response) return fileIds;

  try {
    const data = await fetchDB("/admin/videos", { file_ids: fileIds });
    return Response.json(toCamelCase(data.admin_videos) ?? []);
  } catch (error) {
    console.error("[admin/videos API] DB request error:", error);
    return Response.json({ error: "Failed to fetch video data" }, { status: 500 });
  }
}
