/**
 * @jest-environment node
 */

import { downloadExportJob } from "@/_lib/export/downloadExportJob";
import { supabaseServer } from "@/_lib/supabase/server";
import { statSync, createReadStream, unlinkSync } from "fs";
import { EventEmitter } from "events";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/_lib/supabase/server", () => ({
  supabaseServer: {
    from: jest.fn(),
  },
}));

jest.mock("fs", () => ({
  statSync: jest.fn(),
  createReadStream: jest.fn(),
  unlinkSync: jest.fn(),
}));

jest.mock("path", () => ({
  basename: jest.fn((p: string) => p.split("/").pop()),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockSupabaseJob = (job: object | null, error: object | null = null) => {
  (supabaseServer.from as jest.Mock).mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: job, error }),
    update: jest.fn().mockReturnThis(),
  });
};

const mockSupabaseJobWithUpdate = (job: object) => {
  const updateChain = {
    eq: jest.fn().mockResolvedValue({ error: null }),
  };
  const updateFn = jest.fn().mockReturnValue(updateChain);

  (supabaseServer.from as jest.Mock).mockImplementation((table: string) => {
    if (table === "download_jobs") {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: job, error: null }),
        update: updateFn,
      };
    }
    return {};
  });

  return { updateFn, updateChain };
};

const makeStream = () => {
  const emitter = new EventEmitter() as NodeJS.ReadableStream & EventEmitter;
  return emitter;
};

const completeJob = {
  id: "job-1",
  status: "complete",
  output_path: "/tmp/exports/export-job-1.zip",
  requested_by: "user-1",
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("downloadExportJob", () => {

  describe("job lookup — not found", () => {
    it("returns 404 when the job does not exist", async () => {
      mockSupabaseJob(null, { message: "Not found" });

      const res = await downloadExportJob("job-1", "user-1", "tag");
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toContain("Job not found");
    });

    it("returns 404 when supabase returns no error but null data", async () => {
      mockSupabaseJob(null, null);

      const res = await downloadExportJob("job-1", "user-1", "tag");
      expect(res.status).toBe(404);
    });

    it("includes the tag in the error message", async () => {
      mockSupabaseJob(null, { message: "Not found" });

      const res = await downloadExportJob("job-1", "user-1", "tag");
      const body = await res.json();

      expect(body.error).toContain("[tag]");
    });
  });

  describe("authorisation", () => {
    it("returns 403 when the job belongs to a different user", async () => {
      mockSupabaseJob({ ...completeJob, requested_by: "other-user" });

      const res = await downloadExportJob("job-1", "user-1", "tag");
      const body = await res.json();

      expect(res.status).toBe(403);
      expect(body.error).toContain("Forbidden");
    });

    it("includes the tag in the forbidden error message", async () => {
      mockSupabaseJob({ ...completeJob, requested_by: "other-user" });

      const res = await downloadExportJob("job-1", "user-1", "tag");
      const body = await res.json();

      expect(body.error).toContain("[tag]");
    });
  });

  describe("job status guards", () => {
    it("returns 400 when the job is still processing", async () => {
      mockSupabaseJob({ ...completeJob, status: "processing" });

      const res = await downloadExportJob("job-1", "user-1", "tag");
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toContain("Export not ready");
    });

    it("returns 400 when the job has failed", async () => {
      mockSupabaseJob({ ...completeJob, status: "failed" });

      const res = await downloadExportJob("job-1", "user-1", "tag");

      expect(res.status).toBe(400);
    });

    it("returns 500 when the job is complete but output_path is missing", async () => {
      mockSupabaseJob({ ...completeJob, output_path: null });

      const res = await downloadExportJob("job-1", "user-1", "tag");
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.error).toContain("Output path missing");
    });
  });

  describe("file not found on disk", () => {
    it("returns 404 when statSync throws", async () => {
      mockSupabaseJob(completeJob);
      (statSync as jest.Mock).mockImplementation(() => { throw new Error("ENOENT"); });

      const res = await downloadExportJob("job-1", "user-1", "tag");
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toContain("Export file not found");
    });
  });

  describe("successful download", () => {
    beforeEach(() => {
      mockSupabaseJob(completeJob);
      (statSync as jest.Mock).mockReturnValue({ size: 204800 });
      (createReadStream as jest.Mock).mockReturnValue(makeStream());
    });

    it("returns a 200 response", async () => {
      const res = await downloadExportJob("job-1", "user-1", "tag");
      expect(res.status).toBe(200);
    });

    it("sets Content-Type to application/zip", async () => {
      const res = await downloadExportJob("job-1", "user-1", "tag");
      expect(res.headers.get("Content-Type")).toBe("application/zip");
    });

    it("sets Content-Disposition with the filename", async () => {
      const res = await downloadExportJob("job-1", "user-1", "tag");
      expect(res.headers.get("Content-Disposition")).toBe(
        'attachment; filename="export-job-1.zip"'
      );
    });

    it("sets Content-Length to the file size", async () => {
      const res = await downloadExportJob("job-1", "user-1", "tag");
      expect(res.headers.get("Content-Length")).toBe("204800");
    });

    it("opens a read stream from the correct path", async () => {
      await downloadExportJob("job-1", "user-1", "tag");
      expect(createReadStream).toHaveBeenCalledWith(completeJob.output_path);
    });
  });

  describe("post-stream cleanup", () => {
    it("deletes the file from disk when the stream closes", async () => {
      const stream = makeStream();
      mockSupabaseJob(completeJob);
      (statSync as jest.Mock).mockReturnValue({ size: 1024 });
      (createReadStream as jest.Mock).mockReturnValue(stream);

      await downloadExportJob("job-1", "user-1", "tag");
      stream.emit("close");

      expect(unlinkSync).toHaveBeenCalledWith(completeJob.output_path);
    });

    it("marks the job as expired in supabase after the stream closes", async () => {
      const stream = makeStream();
      const { updateFn, updateChain } = mockSupabaseJobWithUpdate(completeJob);
      (statSync as jest.Mock).mockReturnValue({ size: 1024 });
      (createReadStream as jest.Mock).mockReturnValue(stream);

      await downloadExportJob("job-1", "user-1", "tag");
      stream.emit("close");

      // Allow the async close event handler to finish updating Supabase
      // before asserting on the mocked update calls.
      await Promise.resolve();

      expect(updateFn).toHaveBeenCalledWith({ status: "expired" });
      expect(updateChain.eq).toHaveBeenCalledWith("id", completeJob.id);
    });

    it("does not throw if unlinkSync fails", async () => {
      const stream = makeStream();
      mockSupabaseJob(completeJob);
      (statSync as jest.Mock).mockReturnValue({ size: 1024 });
      (createReadStream as jest.Mock).mockReturnValue(stream);
      (unlinkSync as jest.Mock).mockImplementation(() => { throw new Error("Permission denied"); });

      await downloadExportJob("job-1", "user-1", "tag");

      expect(() => stream.emit("close")).not.toThrow();
    });
  });

});
