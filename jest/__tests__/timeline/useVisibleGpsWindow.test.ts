/**
 * @jest-environment jsdom
 */
import { GpsLocation } from "@/_types/gps_location";
import { renderHook, waitFor } from "@testing-library/react";
import { useVisibleGpsWindow } from "@/_hooks/useVisibleGpsWindow";
import type { TripIdentifier } from "@/_types/trip";
import { act } from "react";

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const tripStart = new Date("2026-06-17T15:46:39.000Z");
const tripEnd = new Date("2026-06-17T18:59:03.000Z");

const initialGps: GpsLocation[] = [
  { time: "2026-06-17T15:46:39Z", latitude: 45.41, longitude: 3.18, speed: 1.71, course: 172.6 },
  { time: "2026-06-17T18:58:56Z", latitude: 45.41, longitude: 3.18, speed: 0.45, course: 0 },
];

const scopedGps: GpsLocation[] = [
  { time: "2026-06-17T15:46:39Z", latitude: 45.41, longitude: 3.18, speed: 1.71, course: 172.6 },
  { time: "2026-06-17T17:22:46Z", latitude: 45.41, longitude: 3.16, speed: 1.29, course: 0 },
];

const fisherIdentifier: TripIdentifier = { role: "fisher", name: "TRP-2026-1" };
const adminIdentifier: TripIdentifier = { role: "admin", id: "5" };

function setup(zoomLevel: number, panOffset: number, identifier: TripIdentifier = fisherIdentifier) {
  return renderHook(
    ({ zoomLevel, panOffset, identifier }) =>
      useVisibleGpsWindow({
        identifier,
        tripStart,
        tripEnd,
        initialGps,
        zoomLevel,
        panOffset,
      }),
    { initialProps: { zoomLevel, panOffset, identifier } }
  );
}

describe("useVisibleGpsWindow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("at default zoom/pan", () => {
    it("uses the initial GPS data without fetching", () => {
      const { result } = setup(1, 0);

      expect(result.current.gpsData).toEqual(initialGps);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("computes the visible window as the full trip range", () => {
      const { result } = setup(1, 0);

      expect(result.current.visibleStart).toEqual(tripStart);
      expect(result.current.visibleEnd).toEqual(tripEnd);
    });
  });

  describe("when zoomed in", () => {
    it("narrows the visible window based on zoom level", () => {
      const { result } = setup(2, 0);

      const expectedDurationMs = (tripEnd.getTime() - tripStart.getTime()) / 2;
      expect(result.current.visibleStart).toEqual(tripStart);
      expect(result.current.visibleEnd.getTime()).toBe(tripStart.getTime() + expectedDurationMs);
    });

    it("debounces the refetch and does not call fetch immediately", () => {
      setup(2, 0);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("fetches a scoped GPS window after the debounce delay", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ gps: scopedGps }),
      });

      const { result } = setup(2, 0);

      act(() => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => expect(result.current.gpsData).toEqual(scopedGps));

      const requestedUrl = mockFetch.mock.calls[0][0] as string;
      expect(requestedUrl).toContain("/api/fisher/trip-details");
      expect(requestedUrl).toContain("trip=TRP-2026-1");
      expect(requestedUrl).toContain(encodeURIComponent(result.current.visibleStart.toISOString()));
      expect(requestedUrl).toContain(encodeURIComponent(result.current.visibleEnd.toISOString()));
    });

    it("sets gpsLoading true while the request is in flight, then false", async () => {
      let resolveFetch: (value: unknown) => void;
      mockFetch.mockReturnValue(
        new Promise(resolve => {
          resolveFetch = resolve;
        })
      );

      const { result } = setup(2, 0);

      act(() => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => expect(result.current.gpsLoading).toBe(true));

      act(() => {
        resolveFetch({ ok: true, json: async () => ({ gps: scopedGps }) });
      });

      await waitFor(() => expect(result.current.gpsLoading).toBe(false));
    });

    it("ignores a failed fetch and keeps the previous gpsData", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: async () => JSON.stringify({ error: "bad params" }),
      });

      const { result } = setup(2, 0);
      const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

      act(() => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => expect(result.current.gpsLoading).toBe(false));

      expect(result.current.gpsData).toEqual(initialGps);
      consoleError.mockRestore();
    });

    it("logs a descriptive error including the status, not a bare Response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: async () => JSON.stringify({ error: "bad params" }),
      });

      setup(2, 0);
      const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

      act(() => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => expect(consoleError).toHaveBeenCalled());

      const loggedMessage = consoleError.mock.calls[0][1];
      expect(String(loggedMessage)).toContain("400");
      consoleError.mockRestore();
    });

    it("falls back to an empty array when the API returns gps: null", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ gps: null }),
      });

      const { result } = setup(2, 0);

      act(() => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => expect(result.current.gpsData).toEqual([]));
    });
  });

  describe("role-based routing", () => {
    it("requests the fisher endpoint using the trip name", async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({ gps: scopedGps }) });

      setup(2, 0, fisherIdentifier);

      act(() => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

      const requestedUrl = mockFetch.mock.calls[0][0] as string;
      expect(requestedUrl).toContain("/api/fisher/trip-details");
      expect(requestedUrl).toContain("trip=TRP-2026-1");
    });

    it("requests the admin endpoint using the trip id", async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({ gps: scopedGps }) });

      setup(2, 0, adminIdentifier);

      act(() => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

      const requestedUrl = mockFetch.mock.calls[0][0] as string;
      expect(requestedUrl).toContain("/api/admin/trip-details");
      expect(requestedUrl).toContain("trip=5");
    });
  });

  describe("when the zoom/pan changes again before the debounce fires", () => {
    it("aborts the previous request and only resolves the latest one", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ gps: scopedGps }),
      });

      const { result, rerender } = setup(2, 0);

      act(() => {
        jest.advanceTimersByTime(200);
      });
      rerender({ zoomLevel: 4, panOffset: 0, identifier: fisherIdentifier });
      act(() => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(result.current.gpsData).toEqual(scopedGps));
    });
  });

  describe("returning to default zoom/pan", () => {
    it("resets gpsData back to initialGps", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ gps: scopedGps }),
      });

      const { result, rerender } = setup(2, 0);
      act(() => {
        jest.advanceTimersByTime(400);
      });
      await waitFor(() => expect(result.current.gpsData).toEqual(scopedGps));

      rerender({ zoomLevel: 1, panOffset: 0, identifier: fisherIdentifier });

      expect(result.current.gpsData).toEqual(initialGps);
    });
  });
});
