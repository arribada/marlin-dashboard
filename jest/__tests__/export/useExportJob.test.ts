/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { useExportJob } from "@/_hooks/useExportJob";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockFetch = (responses: object[]) => {
  let call = 0;
  global.fetch = jest.fn().mockImplementation(() => {
    const body = responses[Math.min(call++, responses.length - 1)];
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(body),
    });
  }) as jest.Mock;
};

const filters = {
  dateRange: { startDate: "2025-01-01", startTime: "00:00", endDate: "2025-01-07", endTime: "23:59" },
  selectedVessels: [1, 2],
  selectedDataTypes: ["gps", "alerts"],
};

const ROLE = 'admin';

// ─── Setup ────────────────────────────────────────────────────────────────────

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useExportJob", () => {

  describe("initial state", () => {
    it("returns null values before any action", () => {
      const { result } = renderHook(() => useExportJob(ROLE));
      expect(result.current.exportStatus).toBeNull();
      expect(result.current.fileSizeBytes).toBeNull();
      expect(result.current.errorMessage).toBeNull();
      expect(result.current.failureCount).toBe(0);
    });
  });

  describe("handleSubmit", () => {
    it("sets status to pending immediately after submit", async () => {
      mockFetch([{ jobId: "job-1" }]);
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });

      expect(result.current.exportStatus).toBe("pending");
    });

    it("posts the correct request body to the export endpoint", async () => {
      mockFetch([{ jobId: "job-1" }]);
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/export/request",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            filter_start: "2025-01-01T00:00:00Z",
            filter_end: "2025-01-07T23:59:00Z",
            include_alerts: true,
            include_bycatch: false,
            include_audio: false,
            include_video: false,
            include_transcripts: false,
            include_gps: true,
            filter_vessel_ids: [1, 2]
          }),
        })
      );
    });

    it("shows an error toast and does not start polling when the request fails", async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false }) as jest.Mock;
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });

      expect(toast.error).toHaveBeenCalledWith("Failed to start export, please try again");
      expect(result.current.exportStatus).toBeNull();
    });

    it("shows an error toast when fetch throws", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error")) as jest.Mock;
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });

      expect(toast.error).toHaveBeenCalledWith("Something went wrong, please try again");
    });
  });

  describe("role-based endpoint routing", () => {
    it.each([
      ['admin',   '/api/admin/export/request'],
      ['fisher',  '/api/fisher/export/request'],
      ['analyst', '/api/analyst/export/request'],
    ] as const)("posts to the correct URL for role '%s'", async (role, expectedUrl) => {
      mockFetch([{ jobId: "job-1" }]);
      const { result } = renderHook(() => useExportJob(role));

      await act(async () => { await result.current.handleSubmit(filters); });

      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("polling — complete", () => {
    it("sets status to complete and stores file size when the job succeeds", async () => {
      mockFetch([
        { jobId: "job-1" },
        { status: "complete", fileSizeBytes: 204800, failureCount: 0 },
      ]);
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });
      await act(async () => { jest.advanceTimersByTime(3000); });

      expect(result.current.exportStatus).toBe("complete");
      expect(result.current.fileSizeBytes).toBe(204800);
    });

    it("shows a success toast when the job completes", async () => {
      mockFetch([
        { jobId: "job-1" },
        { status: "complete", fileSizeBytes: 1024, failureCount: 0 },
      ]);
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });
      await act(async () => { jest.advanceTimersByTime(3000); });

      expect(toast.success).toHaveBeenCalledWith("Export ready, downloading file now");
    });

    it("records failure count from the completed job response", async () => {
      mockFetch([
        { jobId: "job-1" },
        { status: "complete", fileSizeBytes: 1024, failureCount: 3 },
      ]);
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });
      await act(async () => { jest.advanceTimersByTime(3000); });

      expect(result.current.failureCount).toBe(3);
    });

    it("stops polling after the job completes", async () => {
      mockFetch([
        { jobId: "job-1" },
        { status: "complete", fileSizeBytes: 1024, failureCount: 0 },
      ]);
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });
      await act(async () => { jest.advanceTimersByTime(3000); });

      const callCountAfterComplete = (global.fetch as jest.Mock).mock.calls.length;
      await act(async () => { jest.advanceTimersByTime(9000); }); // 3 more intervals

      expect((global.fetch as jest.Mock).mock.calls.length).toBe(callCountAfterComplete);
    });
  });

  describe("polling — processing", () => {
    it("stays in processing status while the job is in progress", async () => {
      mockFetch([
        { jobId: "job-1" },
        { status: "processing" },
        { status: "complete", fileSizeBytes: 512, failureCount: 0 },
      ]);
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });
      // First poll fires after 3000ms (attempt 1), second after 6000ms (attempt 2)
      // Advance only to 3000ms so we see the processing status before complete fires
      await act(async () => { jest.advanceTimersByTime(3000); });
      expect(result.current.exportStatus).toBe("processing");
      await act(async () => { jest.advanceTimersByTime(6000); });
      expect(result.current.exportStatus).toBe("complete");
    });

    it("transitions from processing to complete after a further poll", async () => {
      mockFetch([
        { jobId: "job-1" },
        { status: "processing" },
        { status: "complete", fileSizeBytes: 512, failureCount: 0 },
      ]);
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });
      await act(async () => { jest.advanceTimersByTime(3000); }); // → processing
      await act(async () => { jest.advanceTimersByTime(3000); }); // → complete

      expect(result.current.exportStatus).toBe("complete");
    });
  });

  describe("polling — failed", () => {
    it("sets status to failed and stores the error message", async () => {
      mockFetch([
        { jobId: "job-1" },
        { status: "failed", errorMessage: "Server error" },
      ]);
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });
      await act(async () => { jest.advanceTimersByTime(3000); });

      expect(result.current.exportStatus).toBe("failed");
      expect(result.current.errorMessage).toBe("Server error");
    });

    it("shows an error toast when the job fails", async () => {
      mockFetch([
        { jobId: "job-1" },
        { status: "failed", errorMessage: "Server error" },
      ]);
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });
      await act(async () => { jest.advanceTimersByTime(3000); });

      expect(toast.error).toHaveBeenCalledWith("Server error");
    });

    it("falls back to a default error message if the server provides none", async () => {
      mockFetch([
        { jobId: "job-1" },
        { status: "failed" },
      ]);
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });
      await act(async () => { jest.advanceTimersByTime(3000); });

      expect(result.current.errorMessage).toBe("Export failed, please try again");
    });

    it("stops polling after the job fails", async () => {
      mockFetch([
        { jobId: "job-1" },
        { status: "failed", errorMessage: "Server error" },
      ]);
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });
      await act(async () => { jest.advanceTimersByTime(3000); });

      const callCountAfterFail = (global.fetch as jest.Mock).mock.calls.length;
      await act(async () => { jest.advanceTimersByTime(9000); });

      expect((global.fetch as jest.Mock).mock.calls.length).toBe(callCountAfterFail);
    });
  });

  describe("handleRetry", () => {
    it("resets state and re-submits", async () => {
      mockFetch([
        { jobId: "job-1" },
        { status: "failed" },
        { jobId: "job-2" },
      ]);
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });
      await act(async () => { jest.advanceTimersByTime(3000); });

      expect(result.current.exportStatus).toBe("failed");

      await act(async () => { result.current.handleRetry(filters); });

      expect(result.current.exportStatus).toBe("pending");
      expect(result.current.errorMessage).toBeNull();
      expect(result.current.fileSizeBytes).toBeNull();
      expect(result.current.failureCount).toBe(0);
    });
  });

  describe("handleNewExport", () => {
    it("resets all state back to initial values", async () => {
      mockFetch([
        { jobId: "job-1" },
        { status: "complete", fileSizeBytes: 1024, failureCount: 2 },
      ]);
      const { result } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });
      await act(async () => { jest.advanceTimersByTime(3000); });

      act(() => { result.current.handleNewExport(); });

      expect(result.current.exportStatus).toBeNull();
      expect(result.current.fileSizeBytes).toBeNull();
      expect(result.current.failureCount).toBe(0);
    });
  });

  describe("cleanup", () => {
    it("stops polling when the hook unmounts", async () => {
      mockFetch([
        { jobId: "job-1" },
        { status: "processing" },
      ]);
      const { result, unmount } = renderHook(() => useExportJob(ROLE));

      await act(async () => { await result.current.handleSubmit(filters); });
      await act(async () => { jest.advanceTimersByTime(3000); });

      const callCountBeforeUnmount = (global.fetch as jest.Mock).mock.calls.length;
      unmount();
      await act(async () => { jest.advanceTimersByTime(9000); });

      expect((global.fetch as jest.Mock).mock.calls.length).toBe(callCountBeforeUnmount);
    });
  });

});
