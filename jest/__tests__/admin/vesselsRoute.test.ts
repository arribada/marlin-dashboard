import { GET } from "@/app/api/admin/vessels/route";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/_lib/api/route-helpers";
import { toCamelCase } from "@/_utils/formatting";
import { fetchDB } from "@/_lib/database/client";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/_lib/api/route-helpers", () => ({ requireAdmin: jest.fn() }));
jest.mock("@/_lib/database/client", () => ({ fetchDB: jest.fn() }));
jest.mock("@/_utils/formatting", () => ({ toCamelCase: jest.fn((d) => d) }));

const mockRequireAdmin = requireAdmin as jest.Mock;
const mockFetchDB = fetchDB as jest.MockedFunction<typeof fetchDB>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockAuthOk() {
  mockRequireAdmin.mockResolvedValue({ ok: true, token: { sub: "user-1" } });
}

function mockAuthFail(status: 401 | 403) {
  mockRequireAdmin.mockResolvedValue({
    ok: false,
    response: NextResponse.json(
      { error: status === 401 ? "Unauthorised" : "Forbidden" },
      { status }
    ),
  });
}

function makeRequest(fields?: string) {
  const url = new URL("http://localhost/api/admin/vessels");
  if (fields) url.searchParams.set("fields", fields);
  return new NextRequest(url);
}

const vessels = [
  { id: 1, name: "Ocean Explorer", status: "active", registration: "OE-001" },
  { id: 2, name: "Sea Navigator", status: "inactive", registration: "SN-002" },
];

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => jest.clearAllMocks());

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/admin/vessels", () => {

  describe("authentication", () => {
    it("returns 401 if unauthorised", async () => {
      mockAuthFail(401);

      const res = await GET(makeRequest());

      expect(res.status).toBe(401);
    });

    it("returns 403 if forbidden", async () => {
      mockAuthFail(403);

      const res = await GET(makeRequest());

      expect(res.status).toBe(403);
    });
  });

  describe("field selection", () => {
    it("requests full fields by default", async () => {
      mockAuthOk();
      mockFetchDB.mockResolvedValueOnce({ admin_vessels: vessels });

      await GET(makeRequest());

      expect(mockFetchDB).toHaveBeenCalledWith("/admin/vessels", {});
    });

    it("requests minimal fields when fields=minimal", async () => {
      mockAuthOk();
      mockFetchDB.mockResolvedValueOnce({ admin_vessels: vessels });

      await GET(makeRequest("minimal"));

      expect(mockFetchDB).toHaveBeenCalledWith("/admin/vessels", { minimal: "true" });
    });

    it("requests full fields when fields param is not 'minimal'", async () => {
      mockAuthOk();
      mockFetchDB.mockResolvedValueOnce({ admin_vessels: vessels });

      await GET(makeRequest("full"));

      expect(mockFetchDB).toHaveBeenCalledWith("/admin/vessels", {});
    });
  });

  describe("success response", () => {
    it("returns 200 with camelCased vessel data", async () => {
      mockAuthOk();
      mockFetchDB.mockResolvedValueOnce({ admin_vessels: vessels });

      const res = await GET(makeRequest());

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual(vessels);
    });

    it("passes the data through toCamelCase", async () => {
      mockAuthOk();
      mockFetchDB.mockResolvedValueOnce({ admin_vessels: vessels });

      await GET(makeRequest());

      expect(toCamelCase).toHaveBeenCalledWith(vessels);
    });

    it("returns an empty array when there are no vessels", async () => {
      mockAuthOk();
      mockFetchDB.mockResolvedValueOnce({ admin_vessels: [] });

      const res = await GET(makeRequest());
      const json = await res.json();

      expect(json).toEqual([]);
    });
  });

  describe("error handling", () => {
    it("returns 500 when the DB request fails", async () => {
      mockAuthOk();
      mockFetchDB.mockRejectedValueOnce(new Error("DB error"));

      const res = await GET(makeRequest());

      expect(res.status).toBe(500);
    });

    it("returns the correct error message on db failure", async () => {
      mockAuthOk();
      mockFetchDB.mockRejectedValueOnce(new Error("DB error"));

      const res = await GET(makeRequest());
      const json = await res.json();

      expect(json.error).toBe("Failed to fetch trip history data");
    });
  });

});
