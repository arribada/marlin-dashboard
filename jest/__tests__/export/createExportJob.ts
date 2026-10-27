/**
 * @jest-environment node
 */

import { createExportJob } from "@/_lib/export/createExportJob";
import { supabaseServer } from "@/_lib/supabase/server";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/_lib/supabase/server", () => ({
  supabaseServer: {
    from: jest.fn(),
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockSupabase = ({
  activeJob = null,
  insertedJob = { id: "job-1" },
  insertError = null,
}: {
  activeJob?: object | null;
  insertedJob?: object | null;
  insertError?: object | null;
} = {}) => {
  (supabaseServer.from as jest.Mock).mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: activeJob }),
    single: jest.fn().mockResolvedValue({ data: insertedJob, error: insertError }),
  });
};

const baseParams = {
  requestedBy: "user-1",
  requesterRole: "admin" as const,
  anonymised: false,
  filterStart: "2025-01-01T00:00:00Z",
  filterEnd: "2025-01-07T23:59:00Z",
  vesselIds: [1, 2],
  includes: {
    alerts: true,
    bycatch: false,
    audio: false,
    video: false,
    transcripts: false,
    gps: true,
  },
};

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  // Freeze the clock
  jest.setSystemTime(new Date("2025-01-07T12:00:00Z"));
});

afterEach(() => {
  jest.useRealTimers();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("createExportJob", () => {

  describe("concurrency guard", () => {
    it("returns conflict when an active job exists for the user", async () => {
      mockSupabase({ activeJob: { id: "existing-job" } });

      const result = await createExportJob(baseParams);

      expect(result).toEqual({ conflict: true });
    });

    it("does not insert a new job when a conflict is detected", async () => {
      mockSupabase({ activeJob: { id: "existing-job" } });

      await createExportJob(baseParams);

      const insertCalls = (supabaseServer.from as jest.Mock).mock.results
        .flatMap((r: jest.MockResult<ReturnType<typeof supabaseServer.from>>) => {
          const chain = r.value;
          return chain.insert?.mock?.calls ?? [];
        });

      expect(insertCalls).toHaveLength(0);
    });

    it("queries only pending and processing statuses", async () => {
      mockSupabase({ activeJob: null });

      await createExportJob(baseParams);

      const fromInstance = (supabaseServer.from as jest.Mock).mock.results[0].value;
      expect(fromInstance.in).toHaveBeenCalledWith("status", ["pending", "processing"]);
    });

    it("scopes the conflict check to the requesting user", async () => {
      mockSupabase({ activeJob: null });

      await createExportJob(baseParams);

      const fromInstance = (supabaseServer.from as jest.Mock).mock.results[0].value;
      expect(fromInstance.eq).toHaveBeenCalledWith("requested_by", "user-1");
    });

    it("only considers jobs created in the last 5 minutes", async () => {
      mockSupabase({ activeJob: null });

      await createExportJob(baseParams);

      const expectedCutoff = new Date("2025-01-07T11:55:00Z").toISOString();
      const fromInstance = (supabaseServer.from as jest.Mock).mock.results[0].value;
      expect(fromInstance.gte).toHaveBeenCalledWith("created_at", expectedCutoff);
    });

    it("proceeds with insert when no active job exists", async () => {
      mockSupabase({ activeJob: null });

      const result = await createExportJob(baseParams);

      expect(result).toEqual({ jobId: "job-1" });
    });
  });

  describe("job insertion", () => {
    it("returns the new jobId on success", async () => {
      mockSupabase({ insertedJob: { id: "job-abc" } });

      const result = await createExportJob(baseParams);

      expect(result).toEqual({ jobId: "job-abc" });
    });

    it("returns dbError when supabase insert returns an error", async () => {
      mockSupabase({ insertError: { message: "DB constraint violation" }, insertedJob: null });

      const result = await createExportJob(baseParams);

      expect(result).toEqual({ dbError: true });
    });

    it("returns dbError when supabase insert returns null data", async () => {
      mockSupabase({ insertedJob: null, insertError: null });

      const result = await createExportJob(baseParams);

      expect(result).toEqual({ dbError: true });
    });

    it("inserts with status pending", async () => {
      mockSupabase();

      await createExportJob(baseParams);

      const fromInstance = (supabaseServer.from as jest.Mock).mock.results[0].value;
      expect(fromInstance.insert).toHaveBeenCalledWith(
        expect.objectContaining({ status: "pending" })
      );
    });

    it("inserts the correct filter range", async () => {
      mockSupabase();

      await createExportJob(baseParams);

      const fromInstance = (supabaseServer.from as jest.Mock).mock.results[0].value;
      expect(fromInstance.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          filter_start: "2025-01-01T00:00:00Z",
          filter_end: "2025-01-07T23:59:00Z",
        })
      );
    });

    it("inserts the correct vessel ids", async () => {
      mockSupabase();

      await createExportJob({ ...baseParams, vesselIds: [3, 4] });

      const fromInstance = (supabaseServer.from as jest.Mock).mock.results[0].value;
      expect(fromInstance.insert).toHaveBeenCalledWith(
        expect.objectContaining({ filter_vessel_ids: [3, 4] })
      );
    });

    it("inserts null vessel ids for fisher role", async () => {
      mockSupabase();

      await createExportJob({ ...baseParams, requesterRole: "fisher", vesselIds: null });

      const fromInstance = (supabaseServer.from as jest.Mock).mock.results[0].value;
      expect(fromInstance.insert).toHaveBeenCalledWith(
        expect.objectContaining({ filter_vessel_ids: null })
      );
    });

    it("inserts the correct includes flags", async () => {
      mockSupabase();

      await createExportJob(baseParams);

      const fromInstance = (supabaseServer.from as jest.Mock).mock.results[0].value;
      expect(fromInstance.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          include_alerts: true,
          include_bycatch: false,
          include_audio: false,
          include_video: false,
          include_transcripts: false,
          include_gps: true,
        })
      );
    });

    it("inserts the requester role", async () => {
      mockSupabase();

      await createExportJob({ ...baseParams, requesterRole: "analyst" });

      const fromInstance = (supabaseServer.from as jest.Mock).mock.results[0].value;
      expect(fromInstance.insert).toHaveBeenCalledWith(
        expect.objectContaining({ requester_role: "analyst" })
      );
    });

    it("inserts the anonymised flag", async () => {
      mockSupabase();

      await createExportJob({ ...baseParams, anonymised: true });

      const fromInstance = (supabaseServer.from as jest.Mock).mock.results[0].value;
      expect(fromInstance.insert).toHaveBeenCalledWith(
        expect.objectContaining({ anonymised: true })
      );
    });
  });

});
