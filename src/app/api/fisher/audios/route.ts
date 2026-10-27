import { NextRequest } from "next/server";
import { supabaseServer } from "@/_lib/supabase/server";
import { toCamelCase } from "@/_utils/formatting";
import { parseFileIds, requireFisher } from "@/_lib/api/route-helpers";
import { fetchDB } from "@/_lib/database/client";

export async function GET(req: NextRequest) {
  const result = await requireFisher(req, "fisher/audios API");
  if (!result.ok) return result.response;

  const fileIds = parseFileIds(req, "fisher/audios API");
  if (fileIds instanceof Response) return fileIds;

  try {
    const data = await fetchDB("/fisher/audios", { file_ids: fileIds });
    return Response.json(toCamelCase(data.audios) ?? []);
  } catch (error) {
    console.error("[fisher/audios API] DB request error:", error);
    return Response.json({ error: "Failed to fetch map data" }, { status: 500 });
  }
}
