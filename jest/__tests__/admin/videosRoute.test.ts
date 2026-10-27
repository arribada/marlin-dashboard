import { NextRequest } from "next/server";
import { GET } from "@/app/api/admin/videos/route";
import { fetchDB } from "@/_lib/database/client";
import { requireAdmin, parseFileIds } from "@/_lib/api/route-helpers";
import { toCamelCase } from "@/_utils/formatting";
import type { Token } from "@/_lib/api/route-helpers"; // adjust import path if Token lives elsewhere

jest.mock("@/_lib/database/client", () => ({
  fetchDB: jest.fn(),
}));

jest.mock("@/_lib/api/route-helpers", () => ({
  requireAdmin: jest.fn(),
  parseFileIds: jest.fn(),
}));

jest.mock("@/_utils/formatting", () => ({
  toCamelCase: jest.fn(),
}));

const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>;
const mockParseFileIds = parseFileIds as jest.MockedFunction<typeof parseFileIds>;
const mockFetchDB = fetchDB as jest.MockedFunction<typeof fetchDB>;
const mockToCamelCase = toCamelCase as jest.MockedFunction<typeof toCamelCase>;

const mockToken = { sub: "admin-1", role: "admin" } as unknown as Token;

const mockVideos = [{ id: "abc1", name: "Video 1", file_path: "/path/1" }];
const camelCasedVideos = [{ id: "abc1", name: "Video 1", filePath: "/path/1" }];

describe("GET /api/admin/videos", () => {
  const makeReq = (ids = "abc1") =>
    new NextRequest(`http://localhost:3000/api/admin/videos?ids=${ids}&v=vessel-123`);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 403 if user is not admin", async () => {
    mockRequireAdmin.mockResolvedValueOnce({
      ok: false,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    });

    const response = await GET(makeReq());

    expect(response.status).toBe(403);
  });

  it("returns 400 if file ids are missing", async () => {
    mockRequireAdmin.mockResolvedValueOnce({ ok: true, token: mockToken });
    mockParseFileIds.mockReturnValueOnce(
      Response.json({ error: "Missing ids" }, { status: 400 })
    );

    const response = await GET(makeReq());

    expect(response.status).toBe(400);
  });

  it("returns 500 if DB query fails", async () => {
    mockRequireAdmin.mockResolvedValueOnce({ ok: true, token: mockToken });
    mockParseFileIds.mockReturnValueOnce(["abc1"]);
    mockFetchDB.mockRejectedValueOnce(new Error("DB request failed"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const response = await GET(makeReq());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to fetch video data");

    consoleErrorSpy.mockRestore();
  });

  it("returns 200 and camelCased video data if user is admin with valid ids", async () => {
    mockRequireAdmin.mockResolvedValueOnce({ ok: true, token: mockToken });
    mockParseFileIds.mockReturnValueOnce(["abc1"]);
    mockFetchDB.mockResolvedValueOnce({ admin_videos: mockVideos });
    mockToCamelCase.mockReturnValueOnce(camelCasedVideos);

    const response = await GET(makeReq());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockFetchDB).toHaveBeenCalledWith("/admin/videos", { file_ids: ["abc1"] });
    expect(mockToCamelCase).toHaveBeenCalledWith(mockVideos);
    expect(body).toEqual(camelCasedVideos);
  });

  it("queries with all ids when multiple are provided", async () => {
    mockRequireAdmin.mockResolvedValueOnce({ ok: true, token: mockToken });
    mockParseFileIds.mockReturnValueOnce(["abc1", "abc2", "abc3"]);
    mockFetchDB.mockResolvedValueOnce({ videos: [] });
    mockToCamelCase.mockReturnValueOnce([]);

    await GET(makeReq("abc1,abc2,abc3"));

    expect(mockFetchDB).toHaveBeenCalledWith("/admin/videos", {
      file_ids: ["abc1", "abc2", "abc3"],
    });
  });

  it("returns empty array when videos field is missing from response", async () => {
    mockRequireAdmin.mockResolvedValueOnce({ ok: true, token: mockToken });
    mockParseFileIds.mockReturnValueOnce(["abc1"]);
    mockFetchDB.mockResolvedValueOnce({});
    mockToCamelCase.mockReturnValueOnce(undefined);

    const response = await GET(makeReq());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });
});
