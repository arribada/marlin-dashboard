import { NextRequest } from "next/server";
import { GET } from "@/app/api/analyst/alerts/route";
import { fetchDB } from "@/_lib/database/client";
import { toCamelCase } from "@/_utils/formatting";

jest.mock("@/_lib/database/client", () => ({
  fetchDB: jest.fn(),
}));

jest.mock("@/_utils/formatting", () => ({
  toCamelCase: jest.fn((data) => data),
}));

jest.mock("@/_lib/api/route-helpers", () => ({
  requireAnalyst: jest.fn(),
}));

import { requireAnalyst } from "@/_lib/api/route-helpers";

const mockRequireAnalyst = requireAnalyst as jest.MockedFunction<typeof requireAnalyst>;
const mockFetchDB = fetchDB as jest.MockedFunction<typeof fetchDB>;
const mockToCamelCase = toCamelCase as jest.MockedFunction<typeof toCamelCase>;

const mockToken = { sub: "analyst-1" } as any;

const mockAlerts = [
  { id: "1", name: "alert-001", species_detected: "dolphin", start: "2024-01-15T10:00:00Z" },
  { id: "2", name: "alert-002", species_detected: "turtle", start: "2024-01-15T10:05:00Z" },
];

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/analyst/alerts");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return new NextRequest(url.toString());
}

describe("GET /api/analyst/alerts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAnalyst.mockResolvedValue({ ok: true, token: mockToken });
    mockToCamelCase.mockImplementation((data) => data);
  });

  it("propagates failed validation responses from requireAnalyst", async () => {
    mockRequireAnalyst.mockResolvedValueOnce({
      ok: false,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    });

    const req = makeRequest({ start: "2024-01-15T10:00:00Z", end: "2024-01-15T10:20:00Z" });
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("returns 400 if start is missing", async () => {
    const req = makeRequest({ end: "2024-01-15T10:20:00Z" });
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Missing required params/);
  });

  it("returns 400 if end is missing", async () => {
    const req = makeRequest({ start: "2024-01-15T10:00:00Z" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns alerts on success", async () => {
    mockFetchDB.mockResolvedValueOnce({ recordings: mockAlerts });

    const req = makeRequest({ start: "2024-01-15T10:00:00Z", end: "2024-01-15T10:20:00Z" });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockAlerts);
  });

  it("calls fetchDB with correct params", async () => {
    mockFetchDB.mockResolvedValueOnce({ recordings: mockAlerts });

    const req = makeRequest({ start: "2024-01-15T10:00:00Z", end: "2024-01-15T10:20:00Z" });
    await GET(req);

    expect(mockFetchDB).toHaveBeenCalledWith("/analyst/alerts", {
      start: "2024-01-15T10:00:00Z",
      end: "2024-01-15T10:20:00Z",
    });
  });

  it("returns empty array when recordings field is missing from response", async () => {
    mockFetchDB.mockResolvedValueOnce({});
    mockToCamelCase.mockReturnValueOnce(undefined);

    const req = makeRequest({ start: "2024-01-15T10:00:00Z", end: "2024-01-15T10:20:00Z" });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns 500 and logs error when fetchDB throws", async () => {
    const mockError = new Error("DB request failed");
    mockFetchDB.mockRejectedValueOnce(mockError);

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const req = makeRequest({ start: "2024-01-15T10:00:00Z", end: "2024-01-15T10:20:00Z" });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to fetch data");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[analyst/alerts API] DB request error:",
      mockError
    );

    consoleErrorSpy.mockRestore();
  });
});
