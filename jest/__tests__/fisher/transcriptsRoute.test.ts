import { NextRequest } from "next/server";
import { GET } from "@/app/api/fisher/transcripts/route";
import { fetchDB } from "@/_lib/database/client";
import { toCamelCase } from "@/_utils/formatting";

jest.mock("@/_lib/database/client", () => ({
  fetchDB: jest.fn(),
}));

jest.mock("@/_utils/formatting", () => ({
  toCamelCase: jest.fn(),
}));

jest.mock("@/_lib/api/route-helpers", () => ({
  requireFisher: jest.fn(),
  parseFileIds: jest.fn(),
}));

import { requireFisher, parseFileIds } from "@/_lib/api/route-helpers";

const mockRequireFisher = requireFisher as jest.MockedFunction<typeof requireFisher>;
const mockParseFileIds = parseFileIds as jest.MockedFunction<typeof parseFileIds>;
const mockFetchDB = fetchDB as jest.MockedFunction<typeof fetchDB>;
const mockToCamelCase = toCamelCase as jest.MockedFunction<typeof toCamelCase>;

describe("GET /api/fisher/transcripts", () => {
  const makeReq = (ids = "abc1") =>
    new NextRequest(`http://localhost:3000/api/fisher/transcripts?ids=${ids}&v=vessel-123`);

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireFisher.mockResolvedValue({ ok: true, token: {} as any });
    mockParseFileIds.mockReturnValue(["abc1"]);
    mockToCamelCase.mockImplementation((data) => data);
  });

  it("propagates failed validation responses from requireFisher", async () => {
    mockRequireFisher.mockResolvedValueOnce({
      ok: false,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    });

    const response = await GET(makeReq());
    expect(response.status).toBe(403);
  });

  it("calls fetchDB with correct shape for a single id", async () => {
    mockFetchDB.mockResolvedValueOnce({ transcripts: [] });

    await GET(makeReq("abc1"));

    expect(mockFetchDB).toHaveBeenCalledWith("/fisher/transcripts", { file_ids: ["abc1"] });
  });

  it("calls fetchDB with all ids when multiple are provided", async () => {
    mockParseFileIds.mockReturnValueOnce(["abc1", "abc2", "abc3"]);
    mockFetchDB.mockResolvedValueOnce({ transcripts: [] });

    await GET(makeReq("abc1,abc2,abc3"));

    expect(mockFetchDB).toHaveBeenCalledWith("/fisher/transcripts", {
      file_ids: ["abc1", "abc2", "abc3"],
    });
  });

  it("returns early when parseFileIds returns a Response", async () => {
    mockParseFileIds.mockReturnValueOnce(
      Response.json({ error: "Missing ids" }, { status: 400 })
    );

    const response = await GET(makeReq());
    expect(response.status).toBe(400);
  });

  it("returns 200 with camelCased data on success", async () => {
    const mockData = [
      { name: "transcript1.txt", start: "2025-02-10T09:00:00", transcript_content: "First transcript" },
    ];
    const camelCased = [
      { name: "transcript1.txt", start: "2025-02-10T09:00:00", transcriptContent: "First transcript" },
    ];

    mockFetchDB.mockResolvedValueOnce({ transcripts: mockData });
    mockToCamelCase.mockReturnValueOnce(camelCased);

    const response = await GET(makeReq());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockToCamelCase).toHaveBeenCalledWith(mockData);
    expect(body).toEqual(camelCased);
  });

  it("returns empty array when transcripts field is missing from response", async () => {
    mockFetchDB.mockResolvedValueOnce({});
    mockToCamelCase.mockReturnValueOnce(undefined);

    const response = await GET(makeReq());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns 500 and logs error when fetchDB throws", async () => {
    const mockError = new Error("DB request failed");
    mockFetchDB.mockRejectedValueOnce(mockError);

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const response = await GET(makeReq());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to fetch map data");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[fisher/transcripts API] DB request error:",
      mockError
    );

    consoleErrorSpy.mockRestore();
  });
});
