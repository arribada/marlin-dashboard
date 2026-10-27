/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { useMediaFiles } from "@/_hooks/useMediaFiles";

const mockVideo = { id: "1", name: "video-1.mp4" };
const mockVideo2 = { id: "2", name: "video-2.mp4" };

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

function mockFetchSuccess(data: unknown) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
}

function mockFetchFailure() {
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
}

describe("useMediaFiles", () => {
  describe("when ids are undefined or empty", () => {
    it("returns empty files and null selected without fetching", () => {
      const { result } = renderHook(() =>
        useMediaFiles(undefined, "video", "/api/fisher/videos")
      );

      expect(result.current.files).toEqual([]);
      expect(result.current.selected).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("returns empty files when ids is an empty array", () => {
      const { result } = renderHook(() =>
        useMediaFiles([], "video", "/api/fisher/videos")
      );

      expect(result.current.files).toEqual([]);
      expect(result.current.selected).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("on successful fetch", () => {
    it("sets files and defaults selected to first result", async () => {
      mockFetchSuccess([mockVideo, mockVideo2]);

      const { result } = renderHook(() =>
        useMediaFiles(["1", "2"], "video", "/api/fisher/videos")
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.files).toEqual([mockVideo, mockVideo2]);
      expect(result.current.selected).toEqual(mockVideo);
      expect(result.current.error).toBeNull();
    });

    it("sets selected to null when response is empty", async () => {
      mockFetchSuccess([]);

      const { result } = renderHook(() =>
        useMediaFiles(["1"], "video", "/api/fisher/videos")
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.files).toEqual([]);
      expect(result.current.selected).toBeNull();
    });

    it("constructs correct URL for fisher endpoint (no existing query params)", async () => {
      mockFetchSuccess([mockVideo]);

      renderHook(() =>
        useMediaFiles(["1", "2"], "video", "/api/fisher/videos")
      );

      await waitFor(() =>
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/fisher/videos?ids=1%2C2",
          expect.objectContaining({ signal: expect.any(AbortSignal) })
        )
      );
    });

    it("constructs correct URL for admin endpoint (existing query params)", async () => {
      mockFetchSuccess([mockVideo]);

      renderHook(() =>
        useMediaFiles(["1", "2"], "video", "/api/admin/videos?v=vessel-123")
      );

      await waitFor(() =>
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/admin/videos?v=vessel-123&ids=1%2C2",
          expect.objectContaining({ signal: expect.any(AbortSignal) })
        )
      );
    });
  });

  describe("on failed fetch", () => {
    it("sets error and clears files when response is not ok", async () => {
      mockFetchFailure();

      const { result } = renderHook(() =>
        useMediaFiles(["1"], "video", "/api/fisher/videos")
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe("Unable to load videos");
      expect(result.current.files).toEqual([]);
      expect(result.current.selected).toBeNull();
    });

    it("sets correct error message per media type", async () => {
      mockFetchFailure();

      const { result } = renderHook(() =>
        useMediaFiles(["1"], "audio", "/api/fisher/audios")
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe("Unable to load audios");
    });

    it("sets error when fetch throws", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() =>
        useMediaFiles(["1"], "transcript", "/api/fisher/transcripts")
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe("Unable to load transcripts");
    });
  });

  describe("setSelected", () => {
    it("allows manually overriding the selected file", async () => {
      mockFetchSuccess([mockVideo, mockVideo2]);

      const { result } = renderHook(() =>
        useMediaFiles(["1", "2"], "video", "/api/fisher/videos")
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.setSelected(mockVideo2);
      });

      expect(result.current.selected).toEqual(mockVideo2);
    });
  });

  describe("when ids change", () => {
    it("re-fetches when ids change", async () => {
      mockFetchSuccess([mockVideo]);
      mockFetchSuccess([mockVideo2]);

      const { rerender } = renderHook(
        ({ ids }) => useMediaFiles(ids, "video", "/api/fisher/videos"),
        { initialProps: { ids: ["1"] } }
      );

      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

      rerender({ ids: ["2"] });

      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    });

    it("does not re-fetch when ids array reference changes but values are the same", async () => {
      mockFetchSuccess([mockVideo]);

      const { rerender } = renderHook(
        ({ ids }) => useMediaFiles(ids, "video", "/api/fisher/videos"),
        { initialProps: { ids: ["1", "2"] } }
      );

      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

      rerender({ ids: ["1", "2"] });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
