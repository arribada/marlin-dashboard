import { ShareFileClient } from "@azure/storage-file-share";
import { PassThrough, Readable } from "stream";
import validateEnvVar from "@/_utils/validateEnvVar";

const AZURE_ACCOUNT_NAME = validateEnvVar("AZURE_ACCOUNT_NAME", "string");
const AZURE_SIGNATURE = validateEnvVar("AZURE_SIGNATURE", "string");

export async function getAzureFileStream( shareName: string, filePath: string): Promise<Readable> {
  const url = `https://${AZURE_ACCOUNT_NAME}.file.core.windows.net/${shareName}/${filePath}?${AZURE_SIGNATURE}`;
  const fileClient = new ShareFileClient(url);

  // Azure downloads can stall mid-connection with no error thrown.
  // This enforces a 30s deadline so a stalled download fails fast and doesnt block the job
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 30_000); // 30s timeout to prevent hanging on stalled downloads

  const downloadResponse = await fileClient.download(0, undefined, {
    abortSignal: abortController.signal,
  });
  clearTimeout(timeout);

  if (!downloadResponse.readableStreamBody) {
    throw new Error(`[getAzureFileStream] No stream returned for ${filePath}`);
  }

  // Manually pipe the Azure stream into a Node.js PassThrough stream
  // to avoid type incompatibilities between Web and Node stream definitions
  const passThrough = new PassThrough();
  (downloadResponse.readableStreamBody as any).pipe(passThrough);
  return passThrough;
}
