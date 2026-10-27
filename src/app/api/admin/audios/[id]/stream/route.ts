import { NextRequest } from 'next/server';
import { streamAzureAudio } from '@/_lib/api/stream-azure-file';
import { requireAdmin } from '@/_lib/api/route-helpers';
import { fetchMediaFile } from '@/_lib/database/fetchMediaFile';

export async function GET( req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const result = await requireAdmin(req, "admin/audio-stream API");
  if (!result.ok) return result.response;

  let path;
  try {
    path = await fetchMediaFile(id, "audio");
  } catch (error) {
    console.error("[admin/audio-stream API] DB request error:", error);
    return new Response("File not found", { status: 404 });
  }

  return streamAzureAudio(req, path, "fisher/audio-stream API");
}
