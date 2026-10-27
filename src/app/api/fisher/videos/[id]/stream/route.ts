import { NextRequest } from "next/server";
import { requireFisher } from "@/_lib/api/route-helpers";
import { streamAzureVideo } from "@/_lib/api/stream-azure-file";
import { fetchMediaFile } from "@/_lib/database/fetchMediaFile";

export async function GET( req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const result = await requireFisher(req, "fisher/video-stream API");
  if (!result.ok) return result.response;

  let path;
  try {
    path = await fetchMediaFile(id, "video");
  } catch (error) {
    console.error("[fisher/video-stream API] DB request error:", error);
    return new Response("File not found", { status: 404 });
  }

  return streamAzureVideo(req, path, "fisher/video-stream API");
}
