import { NextRequest } from "next/server";
import { GET } from "@/app/api/admin/media-by-range/route";
import { fetchDB } from "@/_lib/database/client";
import { toCamelCase } from "@/_utils/formatting";

jest.mock("@/_lib/database/client", () => ({
  fetchDB: jest.fn(),
}));

jest.mock("@/_utils/formatting", () => ({
  toCamelCase: jest.fn((data) => data),
}));

jest.mock("@/_lib/api/route-helpers", () => ({
  requireAdmin: jest.fn(),
}));

import { requireAdmin } from "@/_lib/api/route-helpers";

const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>;
const mockFetchDB = fetchDB as jest.MockedFunction<typeof fetchDB>;
const mockToCamelCase = toCamelCase as jest.MockedFunction<typeof toCamelCase>;

const mockMedia = [
  { id: "1", name: "clip-001.mp4", type: "video", file_path: "/path", start: "2024-01-15T10:00:00Z" },
  { id: "2", name: "audio-001.mp3", type: "audio", file_path: "/path", start: "2024-01-15T10:05:00Z" },
];

function makeRequest(params: Record<string, string | string[]>) {
  const url = new URL("http://localhost/api/admin/media-by-range?v=vessel-123");
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => url.searchParams.append(key, v));
    } else {
      url.searchParams.set(key, value);
    }
  });
  return new NextRequest(url.toString());
}

describe("GET /api/admin/media-by-range", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ ok: true, token: {} as any });
    mockToCamelCase.mockImplementation((data) => data);
  });

  it("returns 400 if start is missing", async () => {
    const req = makeRequest({ end: "2024-01-15T10:20:00Z", type: "video" });
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Missing required params/);
  });

  it("returns 400 if end is missing", async () => {
    const req = makeRequest({ start: "2024-01-15T10:00:00Z", type: "video" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 if types are missing", async () => {
    const req = makeRequest({ start: "2024-01-15T10:00:00Z", end: "2024-01-15T10:20:00Z" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 if vessel id is missing", async () => {
    const url = new URL("http://localhost/api/admin/media-by-range");
    url.searchParams.set("start", "2024-01-15T10:00:00Z");
    url.searchParams.set("end", "2024-01-15T10:20:00Z");
    url.searchParams.set("type", "video");
    const req = new NextRequest(url.toString());

    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Missing required params/);
  });

  it("returns 401 if admin check fails", async () => {
    mockRequireAdmin.mockResolvedValueOnce({
      ok: false,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const req = makeRequest({ start: "2024-01-15T10:00:00Z", end: "2024-01-15T10:20:00Z", type: "video" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns media files on success", async () => {
    mockFetchDB.mockResolvedValueOnce({ media: mockMedia });
    const req = makeRequest({
      start: "2024-01-15T10:00:00Z",
      end: "2024-01-15T10:20:00Z",
      type: ["video", "audio"],
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(mockMedia);
  });

  it("calls fetchDB with correct params", async () => {
    mockFetchDB.mockResolvedValueOnce({ media: mockMedia });
    const req = makeRequest({
      start: "2024-01-15T10:00:00Z",
      end: "2024-01-15T10:20:00Z",
      type: ["video", "audio"],
    });
    await GET(req);
    expect(mockFetchDB).toHaveBeenCalledWith("/admin/media-by-range", {
      vessel_id: "vessel-123",
      start: "2024-01-15T10:00:00Z",
      end: "2024-01-15T10:20:00Z",
      types: ["video", "audio"],
    });
  });

  it("returns empty array when media field is missing from response", async () => {
    mockFetchDB.mockResolvedValueOnce({});
    mockToCamelCase.mockReturnValueOnce(undefined);

    const req = makeRequest({
      start: "2024-01-15T10:00:00Z",
      end: "2024-01-15T10:20:00Z",
      type: "video",
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns 500 and logs error when fetchDB throws", async () => {
    const mockError = new Error("DB request failed");
    mockFetchDB.mockRejectedValueOnce(mockError);

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const req = makeRequest({
      start: "2024-01-15T10:00:00Z",
      end: "2024-01-15T10:20:00Z",
      type: "video",
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to fetch media data");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[admin/media-by-range API] DB request error:",
      mockError
    );

    consoleErrorSpy.mockRestore();
  });
});
