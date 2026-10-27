/**
 * @jest-environment node
 */

import { getExportJobStatus } from "@/_lib/export/getExportJobStatus";
import { supabaseServer } from "@/_lib/supabase/server";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/_lib/supabase/server", () => ({
  supabaseServer: {
    from: jest.fn(),
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockSupabaseJob = (job: object | null, error: object | null = null) => {
  (supabaseServer.from as jest.Mock).mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: job, error }),
  });
};

const completeJob = {
  id: "job-1",
  status: "complete",
  output_size_bytes: 204800,
  error_message: null,
  failure_count: 0,
  created_at: "2025-01-01T00:00:00Z",
  processing_started_at: "2025-01-01T00:01:00Z",
  completed_at: "2025-01-01T00:05:00Z",
  requested_by: "user-1",
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getExportJobStatus", () => {

  describe("job lookup — not found", () => {
    it("returns 404 when supabase returns an error", async () => {
      mockSupabaseJob(null, { message: "Not found" });

      const res = await getExportJobStatus("job-1", "user-1", "tag");
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toContain("Job not found");
    });

    it("returns 404 when supabase returns null data with no error", async () => {
      mockSupabaseJob(null, null);

      const res = await getExportJobStatus("job-1", "user-1", "tag");

      expect(res.status).toBe(404);
    });

    it("includes the tag in the error message", async () => {
      mockSupabaseJob(null, { message: "Not found" });

      const res = await getExportJobStatus("job-1", "user-1", "tag");
      const body = await res.json();

      expect(body.error).toContain("[tag]");
    });
  });

  describe("authorisation", () => {
    it("returns 403 when the job belongs to a different user", async () => {
      mockSupabaseJob({ ...completeJob, requested_by: "other-user" });

      const res = await getExportJobStatus("job-1", "user-1", "tag");
      const body = await res.json();

      expect(res.status).toBe(403);
      expect(body.error).toContain("Forbidden");
    });

    it("includes the tag in the forbidden error message", async () => {
      mockSupabaseJob({ ...completeJob, requested_by: "other-user" });

      const res = await getExportJobStatus("job-1", "user-1", "tag");
      const body = await res.json();

      expect(body.error).toContain("[tag]");
    });
  });

  describe("successful response", () => {
    it("returns 200 for an authorised request", async () => {
      mockSupabaseJob(completeJob);

      const res = await getExportJobStatus("job-1", "user-1", "tag");

      expect(res.status).toBe(200);
    });

    it("returns the correct shape for a complete job", async () => {
      mockSupabaseJob(completeJob);

      const res = await getExportJobStatus("job-1", "user-1", "tag");
      const body = await res.json();

      expect(body).toEqual({
        jobId: "job-1",
        status: "complete",
        fileSizeBytes: 204800,
        errorMessage: null,
        failureCount: 0,
        createdAt: "2025-01-01T00:00:00Z",
        processingStartedAt: "2025-01-01T00:01:00Z",
        completedAt: "2025-01-01T00:05:00Z",
      });
    });

    it("returns fileSizeBytes as null when output_size_bytes is null", async () => {
      mockSupabaseJob({ ...completeJob, output_size_bytes: null });

      const res = await getExportJobStatus("job-1", "user-1", "tag");
      const body = await res.json();

      expect(body.fileSizeBytes).toBeNull();
    });

    it("returns errorMessage as null when error_message is null", async () => {
      mockSupabaseJob({ ...completeJob, error_message: null });

      const res = await getExportJobStatus("job-1", "user-1", "tag");
      const body = await res.json();

      expect(body.errorMessage).toBeNull();
    });

    it("returns errorMessage when the job has failed with a message", async () => {
      mockSupabaseJob({ ...completeJob, status: "failed", error_message: "Worker crashed" });

      const res = await getExportJobStatus("job-1", "user-1", "tag");
      const body = await res.json();

      expect(body.errorMessage).toBe("Worker crashed");
    });

    it("defaults failureCount to 0 when failure_count is null", async () => {
      mockSupabaseJob({ ...completeJob, failure_count: null });

      const res = await getExportJobStatus("job-1", "user-1", "tag");
      const body = await res.json();

      expect(body.failureCount).toBe(0);
    });

    it("returns the correct failureCount when set", async () => {
      mockSupabaseJob({ ...completeJob, failure_count: 3 });

      const res = await getExportJobStatus("job-1", "user-1", "tag");
      const body = await res.json();

      expect(body.failureCount).toBe(3);
    });

    it("returns processingStartedAt as null when not yet set", async () => {
      mockSupabaseJob({ ...completeJob, processing_started_at: null });

      const res = await getExportJobStatus("job-1", "user-1", "tag");
      const body = await res.json();

      expect(body.processingStartedAt).toBeNull();
    });

    it("does not expose requested_by in the response", async () => {
      mockSupabaseJob(completeJob);

      const res = await getExportJobStatus("job-1", "user-1", "tag");
      const body = await res.json();

      expect(body).not.toHaveProperty("requested_by");
    });
  });

});
