/**
 * @jest-environment node
 */

import { runExportJob } from "@/_lib/export/runExportJob";
import { supabaseServer } from "@/_lib/supabase/server";
import { buildZip } from "@/_lib/export/buildZip";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/_lib/supabase/server", () => ({
  supabaseServer: { from: jest.fn() },
}));

jest.mock("@/_lib/export/buildZip");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockSupabase = () => {
  const chain = { update: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ error: null }) };
  (supabaseServer.from as jest.Mock).mockReturnValue(chain);
  return chain;
};

const baseFilters = {
  filterStart: "2025-01-01T00:00:00Z",
  filterEnd: "2025-01-07T23:59:00Z",
  vesselIds: [1, 2],
  anonymised: false,
  includeAlerts: true,
  includeBycatch: false,
  includeAudio: false,
  includeVideo: false,
  includeTranscripts: false,
  includeGps: true,
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2025-01-07T12:00:00Z"));
});

afterEach(() => jest.useRealTimers());

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("runExportJob", () => {

  it("marks the job as processing before building the zip", async () => {
    const chain = mockSupabase();
    (buildZip as jest.Mock).mockResolvedValue({ outputPath: "/tmp/out.zip", sizeBytes: 1024, failureCount: 0 });

    await runExportJob("admin", "job-1", baseFilters);

    expect(chain.update).toHaveBeenNthCalledWith(1, expect.objectContaining({
      status: "processing",
      processing_started_at: "2025-01-07T12:00:00.000Z",
    }));
  });

  it("marks the job as complete with zip output after a successful build", async () => {
    const chain = mockSupabase();
    (buildZip as jest.Mock).mockResolvedValue({ outputPath: "/tmp/out.zip", sizeBytes: 204800, failureCount: 2 });

    await runExportJob("admin", "job-1", baseFilters);

    expect(chain.update).toHaveBeenNthCalledWith(2, expect.objectContaining({
      status: "complete",
      output_path: "/tmp/out.zip",
      output_size_bytes: 204800,
      failure_count: 2,
      completed_at: "2025-01-07T12:00:00.000Z",
    }));
  });

  it("marks the job as failed with the error message when buildZip throws", async () => {
    const chain = mockSupabase();
    (buildZip as jest.Mock).mockRejectedValue(new Error("Disk full"));

    await runExportJob("admin", "job-1", baseFilters);

    expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({
      status: "failed",
      error_message: "Error: Disk full",
      completed_at: "2025-01-07T12:00:00.000Z",
    }));
  });

  it("does not throw when buildZip fails", async () => {
    mockSupabase();
    (buildZip as jest.Mock).mockRejectedValue(new Error("Disk full"));

    await expect(runExportJob("admin", "job-1", baseFilters)).resolves.not.toThrow();
  });

  it("still calls buildZip even if the processing update fails", async () => {
    const chain = { update: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ error: { message: "DB error" } }) };
    (supabaseServer.from as jest.Mock).mockReturnValue(chain);
    (buildZip as jest.Mock).mockResolvedValue({ outputPath: "/tmp/out.zip", sizeBytes: 1024, failureCount: 0 });

    await runExportJob("admin", "job-1", baseFilters);

    expect(buildZip).toHaveBeenCalled();
  });

});
