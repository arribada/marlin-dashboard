import { NextRequest } from "next/server";
import { GET } from "@/app/api/fisher/audios/route";
import { fetchDB } from "@/_lib/database/client";
import { requireFisher, parseFileIds } from "@/_lib/api/route-helpers";
import { toCamelCase } from "@/_utils/formatting";
import type { Token } from "@/_lib/api/route-helpers";

jest.mock("@/_lib/database/client", () => ({
  fetchDB: jest.fn(),
}));

jest.mock("@/_lib/api/route-helpers", () => ({
  requireFisher: jest.fn(),
  parseFileIds: jest.fn(),
}));

jest.mock("@/_utils/formatting", () => ({
  toCamelCase: jest.fn(),
}));

const mockRequireFisher = requireFisher as jest.MockedFunction<typeof requireFisher>;
const mockParseFileIds = parseFileIds as jest.MockedFunction<typeof parseFileIds>;
const mockFetchDB = fetchDB as jest.MockedFunction<typeof fetchDB>;
const mockToCamelCase = toCamelCase as jest.MockedFunction<typeof toCamelCase>;

const mockToken = { sub: "fisher-1", role: "fisher" } as unknown as Token;

const mockAudios = [{ id: "abc1", name: "Audio 1", file_path: "/path/1" }];
const camelCasedAudios = [{ id: "abc1", name: "Audio 1", filePath: "/path/1" }];

describe("GET /api/fisher/audios", () => {
  const makeReq = (ids = "abc1") =>
    new NextRequest(`http://localhost:3000/api/fisher/audios?ids=${ids}&v=vessel-123`);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 403 if user is not fisher", async () => {
    mockRequireFisher.mockResolvedValueOnce({
      ok: false,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    });

    const response = await GET(makeReq());

    expect(response.status).toBe(403);
  });

  it("returns 400 if file ids are missing", async () => {
    mockRequireFisher.mockResolvedValueOnce({ ok: true, token: mockToken });
    mockParseFileIds.mockReturnValueOnce(
      Response.json({ error: "Missing ids" }, { status: 400 })
    );

    const response = await GET(makeReq());

    expect(response.status).toBe(400);
  });

  it("returns 500 if DB query fails", async () => {
    mockRequireFisher.mockResolvedValueOnce({ ok: true, token: mockToken });
    mockParseFileIds.mockReturnValueOnce(["abc1"]);
    mockFetchDB.mockRejectedValueOnce(new Error("DB request failed"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const response = await GET(makeReq());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to fetch map data");

    consoleErrorSpy.mockRestore();
  });

  it("returns 200 and camelCased audio data if user is fisher with valid ids", async () => {
    mockRequireFisher.mockResolvedValueOnce({ ok: true, token: mockToken });
    mockParseFileIds.mockReturnValueOnce(["abc1"]);
    mockFetchDB.mockResolvedValueOnce({ audios: mockAudios });
    mockToCamelCase.mockReturnValueOnce(camelCasedAudios);

    const response = await GET(makeReq());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockFetchDB).toHaveBeenCalledWith("/fisher/audios", { file_ids: ["abc1"] });
    expect(mockToCamelCase).toHaveBeenCalledWith(mockAudios);
    expect(body).toEqual(camelCasedAudios);
  });

  it("queries with all ids when multiple are provided", async () => {
    mockRequireFisher.mockResolvedValueOnce({ ok: true, token: mockToken });
    mockParseFileIds.mockReturnValueOnce(["abc1", "abc2", "abc3"]);
    mockFetchDB.mockResolvedValueOnce({ audios: [] });
    mockToCamelCase.mockReturnValueOnce([]);

    await GET(makeReq("abc1,abc2,abc3"));

    expect(mockFetchDB).toHaveBeenCalledWith("/fisher/audios", {
      file_ids: ["abc1", "abc2", "abc3"],
    });
  });

  it("returns empty array when audios field is missing from response", async () => {
    mockRequireFisher.mockResolvedValueOnce({ ok: true, token: mockToken });
    mockParseFileIds.mockReturnValueOnce(["abc1"]);
    mockFetchDB.mockResolvedValueOnce({});
    mockToCamelCase.mockReturnValueOnce(undefined);

    const response = await GET(makeReq());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });
});
