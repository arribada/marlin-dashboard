import { GET as adminGET } from "@/app/api/admin/export/download/[jobId]/route";
import { GET as fisherGET } from "@/app/api/fisher/export/download/[jobId]/route";
import { GET as analystGET } from "@/app/api/analyst/export/download/[jobId]/route";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireFisher, requireAnalyst } from "@/_lib/api/route-helpers";
import { downloadExportJob } from "@/_lib/export/downloadExportJob";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/_lib/api/route-helpers", () => ({
  requireAdmin: jest.fn(),
  requireFisher: jest.fn(),
  requireAnalyst: jest.fn(),
}));

jest.mock("@/_lib/export/downloadExportJob", () => ({
  downloadExportJob: jest.fn(),
}));

const mockRequireAdmin = requireAdmin as jest.Mock;
const mockRequireFisher = requireFisher as jest.Mock;
const mockRequireAnalyst = requireAnalyst as jest.Mock;
const mockDownloadExportJob = downloadExportJob as jest.Mock;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockAuthOk(mockFn: jest.Mock, userId = "user-1") {
  mockFn.mockResolvedValue({ ok: true, token: { sub: userId } });
}

function mockAuthFail(mockFn: jest.Mock, status: 401 | 403) {
  mockFn.mockResolvedValue({
    ok: false,
    response: NextResponse.json(
      { error: status === 401 ? "Unauthorised" : "Forbidden" },
      { status }
    ),
  });
}

function makeRequest() {
  return new NextRequest("http://localhost/api/export/download/job-1", { method: "GET" });
}

const makeParams = (jobId = "job-1") => Promise.resolve({ jobId });

// ─── Tests ────────────────────────────────────────────────────────────────────

const roles = [
  { label: "admin",   GET: adminGET,   mockAuth: mockRequireAdmin },
  { label: "fisher",  GET: fisherGET,  mockAuth: mockRequireFisher },
  { label: "analyst", GET: analystGET, mockAuth: mockRequireAnalyst },
] as const;

beforeEach(() => jest.clearAllMocks());

describe.each(roles)("GET /api/$label/export/download/[jobId]", ({ GET, mockAuth }) => {

  describe("authentication", () => {
    it("returns 401 if unauthorised", async () => {
      mockAuthFail(mockAuth, 401);

      const res = await GET(makeRequest(), { params: makeParams() });

      expect(res.status).toBe(401);
    });

    it("returns 403 if forbidden", async () => {
      mockAuthFail(mockAuth, 403);

      const res = await GET(makeRequest(), { params: makeParams() });

      expect(res.status).toBe(403);
    });

    it("returns 401 when token sub is not a string", async () => {
      mockAuth.mockResolvedValue({ ok: true, token: { sub: null } });

      const res = await GET(makeRequest(), { params: makeParams() });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Invalid token");
    });
  });

  describe("download", () => {
    it("calls downloadExportJob with the correct jobId and userId", async () => {
      mockAuthOk(mockAuth, "user-1");
      mockDownloadExportJob.mockResolvedValue(new NextResponse(null, { status: 200 }));

      await GET(makeRequest(), { params: makeParams("job-abc") });

      expect(mockDownloadExportJob).toHaveBeenCalledWith(
        "job-abc",
        "user-1",
        expect.any(String)
      );
    });

    it("returns the response from downloadExportJob", async () => {
      mockAuthOk(mockAuth);
      mockDownloadExportJob.mockResolvedValue(new NextResponse(null, { status: 200 }));

      const res = await GET(makeRequest(), { params: makeParams() });

      expect(res.status).toBe(200);
    });
  });

});
