import { ShareFileClient } from "@azure/storage-file-share";
import { Readable } from "stream";
import type { ReadableStream as WebReadableStream } from "stream/web";
import validateEnvVar from "@/_utils/validateEnvVar";

validateEnvVar("AZURE_ACCOUNT_NAME", "string");
validateEnvVar("AZURE_SIGNATURE", "string");

async function streamAzureFile(
  req: Request,
  path: string,
  tag: string,
  defaultContentType: "video/mp4" | "audio/wav"
): Promise<Response> {
  try {
    const fileClient = new ShareFileClient(
      `https://${process.env.AZURE_ACCOUNT_NAME}.file.core.windows.net/${path}?${process.env.AZURE_SIGNATURE}`
    );

    const props = await fileClient.getProperties();
    const fileSize = props.contentLength;
    if (typeof fileSize !== "number") {
      return new Response("Unable to determine file size", { status: 502 });
    }

    const range = req.headers.get("range");

    let start = 0;
    let end = fileSize - 1;
    let status = 200;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : end;

      if (isNaN(start) || isNaN(end) || start < 0 || end >= fileSize || start > end) {
        return new Response("Range Not Satisfiable", {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        });
      }

      status = 206;
    }

    const downloadResp = await fileClient.download(start, end - start + 1);
    const nodeStream = downloadResp.readableStreamBody as Readable;
    nodeStream.on("error", (err) => {
      console.error(`[${tag}] Stream error (client likely disconnected):`, err.message);
    });

    const webStream = Readable.toWeb(nodeStream) as WebReadableStream<Uint8Array>;

    const headers = new Headers({
      "Content-Type": props.contentType || defaultContentType,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
    });

    if (status === 206) {
      headers.set("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    }

    return new Response(webStream as ReadableStream<Uint8Array>, { status, headers });
  } catch (error) {
    console.error(`[${tag}] Error fetching file:`, error);

    if (error instanceof Error && error.message === "File not found") {
      return new Response("File not found", { status: 404 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}

export function streamAzureVideo(req: Request, path: string, tag: string) {
  return streamAzureFile(req, path, tag, "video/mp4");
}

export function streamAzureAudio(req: Request, path: string, tag: string) {
  return streamAzureFile(req, path, tag, "audio/wav");
}
