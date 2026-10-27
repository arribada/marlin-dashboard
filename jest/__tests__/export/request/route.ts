import { POST as adminPOST } from "@/app/api/admin/export/request/route";
import { POST as fisherPOST } from "@/app/api/fisher/export/request/route";
import { POST as analystPOST } from "@/app/api/analyst/export/request/route";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireFisher, requireAnalyst, extractVesselId } from "@/_lib/api/route-helpers";
import { createExportJob } from "@/_lib/export/createExportJob";
import { runExportJob } from "@/_lib/export/runExportJob";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/_lib/api/route-helpers", () => ({
  requireAdmin: jest.fn(),
  requireFisher: jest.fn(),
  requireAnalyst: jest.fn(),
  extractVesselId: jest.fn(),
}));

jest.mock("@/_lib/export/createExportJob", () => ({ createExportJob: jest.fn() }));
jest.mock("@/_lib/export/runExportJob", () => ({ runExportJob: jest.fn() }));

const mockRequireAdmin   = requireAdmin as jest.Mock;
const mockRequireFisher  = requireFisher as jest.Mock;
const mockRequireAnalyst = requireAnalyst as jest.Mock;
const mockExtractVesselId = extractVesselId as jest.Mock;
const mockCreateExportJob = createExportJob as jest.Mock;
const mockRunExportJob    = runExportJob as jest.Mock;

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

function mockJobCreated(jobId = "job-1") {
  mockCreateExportJob.mockResolvedValue({ jobId });
}

function makeRequest(url: string, body: object) {
  return new NextRequest(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const adminBody = {
  filter_start: "2025-01-01T00:00:00Z",
  filter_end: "2025-01-07T23:59:00Z",
  filter_vessel_ids: [1, 2],
  include_alerts: true,
  include_bycatch: false,
  include_audio: true,
  include_video: false,
  include_transcripts: false,
  include_gps: true,
};

const fisherBody = {
  filter_start: "2025-01-01T00:00:00Z",
  filter_end: "2025-01-07T23:59:00Z",
  include_alerts: true,
  include_bycatch: false,
  include_audio: true,
  include_video: false,
  include_transcripts: false,
  include_gps: true,
};

const analystBody = {
  filter_start: "2025-01-01T00:00:00Z",
  filter_end: "2025-01-07T23:59:00Z",
  include_alerts: true,
  include_bycatch: false,
  include_gps: true,
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockRunExportJob.mockResolvedValue(undefined);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/admin/export/request", () => {
  const POST = adminPOST;
  const url = "http://localhost/api/admin/export/request";
  const req = (body = adminBody) => makeRequest(url, body);

  describe("authentication", () => {
    it("returns 401 if unauthorised", async () => {
      mockAuthFail(mockRequireAdmin, 401);
      expect((await POST(req())).status).toBe(401);
    });

    it("returns 403 if forbidden", async () => {
      mockAuthFail(mockRequireAdmin, 403);
      expect((await POST(req())).status).toBe(403);
    });

    it("returns 401 when token sub is not a string", async () => {
      mockRequireAdmin.mockResolvedValue({ ok: true, token: { sub: null } });
      expect((await POST(req())).status).toBe(401);
    });
  });

  describe("validation", () => {
    it("returns 400 when filter_start is missing", async () => {
      mockAuthOk(mockRequireAdmin);
      const { filter_start, ...body } = adminBody;
      const req = (body: object = adminBody) => makeRequest(url, body);
      expect((await POST(req(body))).status).toBe(400);
    });

    it("returns 400 when filter_end is missing", async () => {
      mockAuthOk(mockRequireAdmin);
      const { filter_end, ...body } = adminBody;
      const req = (body: object = adminBody) => makeRequest(url, body);
      expect((await POST(req(body))).status).toBe(400);
    });

    it("returns 400 when filter_vessel_ids is missing", async () => {
      mockAuthOk(mockRequireAdmin);
      const { filter_vessel_ids, ...body } = adminBody;
      const req = (body: object = adminBody) => makeRequest(url, body);
      expect((await POST(req(body))).status).toBe(400);
    });

    it("returns 400 when filter_vessel_ids is empty", async () => {
      mockAuthOk(mockRequireAdmin);
      expect((await POST(req({ ...adminBody, filter_vessel_ids: [] }))).status).toBe(400);
    });

    it("returns 400 for invalid dates", async () => {
      mockAuthOk(mockRequireAdmin);
      expect((await POST(req({ ...adminBody, filter_start: "bad-date" }))).status).toBe(400);
    });
  });

  describe("createExportJob", () => {
    it("calls createExportJob with anonymised false and vessel ids", async () => {
      mockAuthOk(mockRequireAdmin, "user-1");
      mockJobCreated();

      await POST(req());

      expect(mockCreateExportJob).toHaveBeenCalledWith(expect.objectContaining({
        requestedBy: "user-1",
        requesterRole: "admin",
        anonymised: false,
        vesselIds: [1, 2],
      }));
    });

    it("defaults missing include flags to false", async () => {
      mockAuthOk(mockRequireAdmin);
      mockJobCreated();
      const req = (body: object = adminBody) => makeRequest(url, body);
      await POST(req({ filter_start: adminBody.filter_start, filter_end: adminBody.filter_end, filter_vessel_ids: [1] }));
      expect(mockCreateExportJob).toHaveBeenCalledWith(expect.objectContaining({
        includes: { alerts: false, bycatch: false, audio: false, video: false, transcripts: false, gps: false },
      }));
    });

    it("returns 429 on conflict", async () => {
      mockAuthOk(mockRequireAdmin);
      mockCreateExportJob.mockResolvedValue({ conflict: true });
      expect((await POST(req())).status).toBe(429);
    });

    it("returns 500 on db error", async () => {
      mockAuthOk(mockRequireAdmin);
      mockCreateExportJob.mockResolvedValue({ dbError: true });
      expect((await POST(req())).status).toBe(500);
    });
  });

  describe("success", () => {
    it("returns 200 with jobId", async () => {
      mockAuthOk(mockRequireAdmin);
      mockJobCreated("job-abc");

      const res = await POST(req());
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ jobId: "job-abc" });
    });

    it("fires runExportJob with role admin and anonymised false", async () => {
      mockAuthOk(mockRequireAdmin);
      mockJobCreated("job-1");

      await POST(req());

      expect(mockRunExportJob).toHaveBeenCalledWith("admin", "job-1",
        expect.objectContaining({ anonymised: false, vesselIds: [1, 2] })
      );
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/fisher/export/request", () => {
  const POST = fisherPOST;
  const url = "http://localhost/api/fisher/export/request";
  const req = (body = fisherBody) => makeRequest(url, body);

  beforeEach(() => {
    mockExtractVesselId.mockReturnValue("12");
  });

  describe("authentication", () => {
    it("returns 401 if unauthorised", async () => {
      mockAuthFail(mockRequireFisher, 401);
      expect((await POST(req())).status).toBe(401);
    });

    it("returns 403 if forbidden", async () => {
      mockAuthFail(mockRequireFisher, 403);
      expect((await POST(req())).status).toBe(403);
    });

    it("returns 401 when token sub is not a string", async () => {
      mockRequireFisher.mockResolvedValue({ ok: true, token: { sub: null } });
      expect((await POST(req())).status).toBe(401);
    });
  });

  describe("vessel extraction", () => {
    it("returns the error response from extractVesselId", async () => {
      mockAuthOk(mockRequireFisher);
      mockExtractVesselId.mockReturnValue(
        NextResponse.json({ error: "Missing vessel" }, { status: 400 })
      );
      expect((await POST(req())).status).toBe(400);
    });

    it("returns 400 for a non-numeric vessel id", async () => {
      mockAuthOk(mockRequireFisher);
      mockExtractVesselId.mockReturnValue("abc");
      const res = await POST(req());
      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe("Invalid vessel ID");
    });
  });

  describe("validation", () => {
    it("returns 400 when filter_start is missing", async () => {
      mockAuthOk(mockRequireFisher);
      const { filter_start, ...body } = fisherBody;
      const req = (body: object = fisherBody) => makeRequest(url, body);
      expect((await POST(req(body))).status).toBe(400);
    });

    it("returns 400 when filter_end is missing", async () => {
      mockAuthOk(mockRequireFisher);
      const { filter_end, ...body } = fisherBody;
      const req = (body: object = fisherBody) => makeRequest(url, body);
      expect((await POST(req(body))).status).toBe(400);
    });

    it("returns 400 for invalid dates", async () => {
      mockAuthOk(mockRequireFisher);
      expect((await POST(req({ ...fisherBody, filter_start: "bad-date" }))).status).toBe(400);
    });
  });

  describe("createExportJob", () => {
    it("calls createExportJob with anonymised true and the extracted vessel id", async () => {
      mockAuthOk(mockRequireFisher, "user-1");
      mockJobCreated();

      await POST(req());

      expect(mockCreateExportJob).toHaveBeenCalledWith(expect.objectContaining({
        requestedBy: "user-1",
        requesterRole: "fisher",
        anonymised: true,
        vesselIds: [12],
      }));
    });

    it("returns 429 on conflict", async () => {
      mockAuthOk(mockRequireFisher);
      mockCreateExportJob.mockResolvedValue({ conflict: true });
      expect((await POST(req())).status).toBe(429);
    });

    it("returns 500 on db error", async () => {
      mockAuthOk(mockRequireFisher);
      mockCreateExportJob.mockResolvedValue({ dbError: true });
      expect((await POST(req())).status).toBe(500);
    });
  });

  describe("success", () => {
    it("returns 200 with jobId", async () => {
      mockAuthOk(mockRequireFisher);
      mockJobCreated("job-abc");

      const res = await POST(req());
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ jobId: "job-abc" });
    });

    it("fires runExportJob with role fisher and anonymised true", async () => {
      mockAuthOk(mockRequireFisher);
      mockJobCreated("job-1");

      await POST(req());

      expect(mockRunExportJob).toHaveBeenCalledWith("fisher", "job-1",
        expect.objectContaining({ anonymised: true })
      );
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/analyst/export/request", () => {
  const POST = analystPOST;
  const url = "http://localhost/api/analyst/export/request";
  const req = (body = analystBody) => makeRequest(url, body);

  describe("authentication", () => {
    it("returns 401 if unauthorised", async () => {
      mockAuthFail(mockRequireAnalyst, 401);
      expect((await POST(req())).status).toBe(401);
    });

    it("returns 403 if forbidden", async () => {
      mockAuthFail(mockRequireAnalyst, 403);
      expect((await POST(req())).status).toBe(403);
    });

    it("returns 401 when token sub is not a string", async () => {
      mockRequireAnalyst.mockResolvedValue({ ok: true, token: { sub: null } });
      expect((await POST(req())).status).toBe(401);
    });
  });

  describe("validation", () => {
    it("returns 400 when filter_start is missing", async () => {
      mockAuthOk(mockRequireAnalyst);
      const { filter_start, ...body } = analystBody;
      const req = (body: object = analystBody) => makeRequest(url, body);
      expect((await POST(req(body))).status).toBe(400);
    });

    it("returns 400 when filter_end is missing", async () => {
      mockAuthOk(mockRequireAnalyst);
      const { filter_end, ...body } = analystBody;
      const req = (body: object = analystBody) => makeRequest(url, body);
      expect((await POST(req(body))).status).toBe(400);
    });

    it("returns 400 for invalid dates", async () => {
      mockAuthOk(mockRequireAnalyst);
      expect((await POST(req({ ...analystBody, filter_start: "bad-date" }))).status).toBe(400);
    });
  });

  describe("createExportJob", () => {
    it("calls createExportJob with anonymised true, null vesselIds, and media flags forced false", async () => {
      mockAuthOk(mockRequireAnalyst, "user-1");
      mockJobCreated();

      await POST(req());

      expect(mockCreateExportJob).toHaveBeenCalledWith(expect.objectContaining({
        requestedBy: "user-1",
        requesterRole: "analyst",
        anonymised: true,
        vesselIds: null,
        includes: expect.objectContaining({ audio: false, video: false, transcripts: false }),
      }));
    });

    it("returns 429 on conflict", async () => {
      mockAuthOk(mockRequireAnalyst);
      mockCreateExportJob.mockResolvedValue({ conflict: true });
      expect((await POST(req())).status).toBe(429);
    });

    it("returns 500 on db error", async () => {
      mockAuthOk(mockRequireAnalyst);
      mockCreateExportJob.mockResolvedValue({ dbError: true });
      expect((await POST(req())).status).toBe(500);
    });
  });

  describe("success", () => {
    it("returns 200 with jobId", async () => {
      mockAuthOk(mockRequireAnalyst);
      mockJobCreated("job-abc");

      const res = await POST(req());
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ jobId: "job-abc" });
    });

    it("fires runExportJob with role analyst and media flags false", async () => {
      mockAuthOk(mockRequireAnalyst);
      mockJobCreated("job-1");

      await POST(req());

      expect(mockRunExportJob).toHaveBeenCalledWith("analyst", "job-1",
        expect.objectContaining({ anonymised: true, includeAudio: false, includeVideo: false, includeTranscripts: false })
      );
    });
  });
});
