import { GET } from "@/app/api/fisher/audios/[id]/stream/route";
import { NextRequest } from "next/server";
import { Readable } from "stream";

jest.mock("@/_lib/api/route-helpers", () => ({
  requireFisher: jest.fn().mockResolvedValue({ ok: true }),
}));

import { requireFisher } from "@/_lib/api/route-helpers";

jest.mock("@/_lib/database/fetchMediaFile", () => ({
  fetchMediaFile: jest.fn().mockResolvedValue("marlin-9678e49e/2026-07-23/audio/test-audio.wav"),
}));

import { fetchMediaFile } from "@/_lib/database/fetchMediaFile";

// Mock Azure ShareFileClient
const mockGetProperties = jest.fn();
const mockDownload = jest.fn();

jest.mock("@azure/storage-file-share", () => ({
  ShareFileClient: jest.fn().mockImplementation(() => ({
    getProperties: mockGetProperties,
    download: mockDownload,
  })),
}));

// Mock Readable.toWeb
const mockToWeb = jest.fn();
jest.spyOn(Readable, "toWeb").mockImplementation(mockToWeb);

describe("GET /api/fisher/audios/[id]/stream", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireFisher as jest.Mock).mockResolvedValue({ ok: true });
    (fetchMediaFile as jest.Mock).mockResolvedValue(
      "marlin-9678e49e/2026-07-23/audio/test-audio.wav"
    );

    process.env.AZURE_ACCOUNT_NAME = "test-account";
    process.env.AZURE_SIGNATURE = "test-signature";
  });

  const makeReq = (headers?: Record<string, string>) => {
    const req = new NextRequest("http://localhost:3000/api/fisher/audios/abc1/stream");
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => req.headers.set(key, value));
    }
    return req;
  };

  const makeContext = (id = "abc1") => ({
    params: Promise.resolve({ id }),
  });

  const createMockStream = () => {
    const stream = new Readable({ read() {} });
    stream.on = jest.fn().mockReturnValue(stream);
    return stream;
  };

  it("propagates failed validation responses from requireFisher", async () => {
    (requireFisher as jest.Mock).mockResolvedValueOnce({
      ok: false,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    });

    const response = await GET(makeReq(), makeContext());
    expect(response.status).toBe(403);
  });

  it("returns 404 when file is not found", async () => {
    (fetchMediaFile as jest.Mock).mockRejectedValueOnce(new Error("File not found"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const response = await GET(makeReq(), makeContext());
    const text = await response.text();

    expect(response.status).toBe(404);
    expect(text).toBe("File not found");

    consoleErrorSpy.mockRestore();
  });

  it("returns 416 for invalid range - start beyond file size", async () => {
    mockGetProperties.mockResolvedValueOnce({ contentLength: 1000, contentType: "audio/wav" });

    const response = await GET(makeReq({ range: "bytes=1500-2000" }), makeContext());
    const text = await response.text();

    expect(response.status).toBe(416);
    expect(text).toBe("Range Not Satisfiable");
    expect(response.headers.get("Content-Range")).toBe("bytes */1000");
  });

  it("returns 416 for invalid range - end beyond file size", async () => {
    mockGetProperties.mockResolvedValueOnce({ contentLength: 1000, contentType: "audio/wav" });

    const response = await GET(makeReq({ range: "bytes=500-1500" }), makeContext());
    const text = await response.text();

    expect(response.status).toBe(416);
    expect(text).toBe("Range Not Satisfiable");
    expect(response.headers.get("Content-Range")).toBe("bytes */1000");
  });

  it("returns 416 for invalid range - start greater than end", async () => {
    mockGetProperties.mockResolvedValueOnce({ contentLength: 1000, contentType: "audio/wav" });

    const response = await GET(makeReq({ range: "bytes=500-400" }), makeContext());
    const text = await response.text();

    expect(response.status).toBe(416);
    expect(text).toBe("Range Not Satisfiable");
    expect(response.headers.get("Content-Range")).toBe("bytes */1000");
  });

  it("returns 416 for invalid range - negative start", async () => {
    mockGetProperties.mockResolvedValueOnce({ contentLength: 1000, contentType: "audio/wav" });

    const response = await GET(makeReq({ range: "bytes=-100-500" }), makeContext());
    const text = await response.text();

    expect(response.status).toBe(416);
    expect(text).toBe("Range Not Satisfiable");
  });

  it("streams full audio file successfully (no range)", async () => {
    const mockStream = createMockStream();
    mockToWeb.mockReturnValue(new ReadableStream());
    mockGetProperties.mockResolvedValueOnce({ contentLength: 500000, contentType: "audio/wav" });
    mockDownload.mockResolvedValueOnce({ readableStreamBody: mockStream });

    const response = await GET(makeReq(), makeContext());

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("audio/wav");
    expect(response.headers.get("Content-Length")).toBe("500000");
    expect(response.headers.get("Accept-Ranges")).toBe("bytes");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600");
    expect(response.headers.get("Content-Range")).toBeNull();
    expect(mockDownload).toHaveBeenCalledWith(0, 500000);
  });

  it("streams partial audio file with range request", async () => {
    const mockStream = createMockStream();
    mockToWeb.mockReturnValue(new ReadableStream());
    mockGetProperties.mockResolvedValueOnce({ contentLength: 500000, contentType: "audio/wav" });
    mockDownload.mockResolvedValueOnce({ readableStreamBody: mockStream });

    const response = await GET(makeReq({ range: "bytes=0-9999" }), makeContext());

    expect(response.status).toBe(206);
    expect(response.headers.get("Content-Range")).toBe("bytes 0-9999/500000");
    expect(response.headers.get("Content-Length")).toBe("10000");
    expect(mockDownload).toHaveBeenCalledWith(0, 10000);
  });

  it("handles range request with only start byte", async () => {
    const mockStream = createMockStream();
    mockToWeb.mockReturnValue(new ReadableStream());
    mockGetProperties.mockResolvedValueOnce({ contentLength: 500000, contentType: "audio/wav" });
    mockDownload.mockResolvedValueOnce({ readableStreamBody: mockStream });

    const response = await GET(makeReq({ range: "bytes=100000-" }), makeContext());

    expect(response.status).toBe(206);
    expect(response.headers.get("Content-Range")).toBe("bytes 100000-499999/500000");
    expect(response.headers.get("Content-Length")).toBe("400000");
    expect(mockDownload).toHaveBeenCalledWith(100000, 400000);
  });

  it("uses default content type when not provided", async () => {
    const mockStream = createMockStream();
    mockToWeb.mockReturnValue(new ReadableStream());
    mockGetProperties.mockResolvedValueOnce({ contentLength: 500000, contentType: null });
    mockDownload.mockResolvedValueOnce({ readableStreamBody: mockStream });

    const response = await GET(makeReq(), makeContext());

    expect(response.headers.get("Content-Type")).toBe("audio/wav");
  });

  it("attaches error handler to stream", async () => {
    const mockStream = createMockStream();
    mockToWeb.mockReturnValue(new ReadableStream());
    mockGetProperties.mockResolvedValueOnce({ contentLength: 500000, contentType: "audio/wav" });
    mockDownload.mockResolvedValueOnce({ readableStreamBody: mockStream });

    await GET(makeReq(), makeContext());

    expect(mockStream.on).toHaveBeenCalledWith("error", expect.any(Function));
  });

  it("returns 500 for unexpected errors", async () => {
    mockGetProperties.mockRejectedValueOnce(new Error("Azure connection failed"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const response = await GET(makeReq(), makeContext());
    const text = await response.text();

    expect(response.status).toBe(500);
    expect(text).toBe("Internal Server Error");
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
