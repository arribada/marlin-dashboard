import { NextRequest } from "next/server";
import { toCamelCase } from "@/_utils/formatting";
import { parseFileIds, requireAdmin } from "@/_lib/api/route-helpers";
import { fetchDB } from "@/_lib/database/client";

export async function GET(req: NextRequest) {
  const result = await requireAdmin(req, "admin/audios API");
  if (!result.ok) return result.response;

  const fileIds = parseFileIds(req, "admin/audios API");
  if (fileIds instanceof Response) return fileIds;

  try {
    const data = await fetchDB("/admin/audios", { file_ids: fileIds });
    return Response.json(toCamelCase(data.admin_audios) ?? []);
  } catch (error) {
    console.error("[admin/audios API] DB request error:", error);
    return Response.json({ error: "Failed to fetch map data" }, { status: 500 });
  }
}
