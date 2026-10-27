import { NextRequest } from "next/server";
import { toCamelCase } from "@/_utils/formatting";
import { parseFileIds, requireFisher } from "@/_lib/api/route-helpers";
import { fetchDB } from "@/_lib/database/client";

export async function GET(req: NextRequest) {
  const result = await requireFisher(req, "fisher/transcripts API");
  if (!result.ok) return result.response;

  const fileIds = parseFileIds(req, "fisher/audios API");
  if (fileIds instanceof Response) return fileIds;

  try {
    const data = await fetchDB("/fisher/transcripts", { file_ids: fileIds });
    return Response.json(toCamelCase(data.transcripts) ?? []);
  } catch (error) {
    console.error("[fisher/transcripts API] DB request error:", error);
    return Response.json({ error: "Failed to fetch map data" }, { status: 500 });
  }
}
