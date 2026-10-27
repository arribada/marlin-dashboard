import { NextRequest } from "next/server";
import { requireAdmin } from "@/_lib/api/route-helpers";
import { streamAzureVideo } from "@/_lib/api/stream-azure-file";
import { fetchMediaFile } from "@/_lib/database/fetchMediaFile";

export async function GET( req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const result = await requireAdmin(req, "admin/video-stream API");
  if (!result.ok) return result.response;

  let path;
  try {
    path = await fetchMediaFile(id, "video");
  } catch (error) {
    console.error("[admin/video-stream API] DB request error:", error);
    return new Response("File not found", { status: 404 });
  }

  return streamAzureVideo(req, path, "admin/video-stream API");
}
