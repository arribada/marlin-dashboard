import { NextRequest } from "next/server";
import { GET } from "@/app/api/admin/map/route";
import { fetchDB } from "@/_lib/database/client";
import { requireAdmin } from "@/_lib/api/route-helpers";
import { toCamelCase } from "@/_utils/formatting";

jest.mock("@/_lib/database/client", () => ({
  fetchDB: jest.fn(),
}));

jest.mock("@/_lib/api/route-helpers", () => ({
  requireAdmin: jest.fn(),
}));

const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>;
const mockFetchDB = fetchDB as jest.MockedFunction<typeof fetchDB>;

function makeRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL("http://localhost/api/admin/map");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return new NextRequest(url);
}

const defaultParams = {
  start: "2025-01-01T00:00:00.000Z",
  end: "2026-01-01T00:00:00.000Z",
};

const mockToken = { role: "admin" };

const sampleRecording = {
  vessel_id: 1,
  id: 5,
  name: "AL-cra-2026-5",
  time: "2026-07-23T18:21:14Z",
  latitude: 45.4029541015625,
  longitude: 3.2081333324313164,
  species_detected: null,
  has_transcript: true,
  has_video: true,
  has_audio: true,
  trip_id: "5",
  trip_name: "TRP-2026-5",
};

describe("GET /api/admin/map", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("auth", () => {
    it("returns 401 when not authenticated", async () => {
      mockRequireAdmin.mockResolvedValue({
        ok: false,
        response: Response.json({ error: "Unauthorised" }, { status: 401 }),
      });

      const res = await GET(makeRequest(defaultParams));

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "Unauthorised" });
      expect(mockFetchDB).not.toHaveBeenCalled();
    });

    it("returns 403 when authenticated but not admin", async () => {
      mockRequireAdmin.mockResolvedValue({
        ok: false,
        response: Response.json({ error: "Forbidden" }, { status: 403 }),
      });

      const res = await GET(makeRequest(defaultParams));

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: "Forbidden" });
      expect(mockFetchDB).not.toHaveBeenCalled();
    });
  });

  describe("param validation", () => {
    beforeEach(() => {
      mockRequireAdmin.mockResolvedValue({ ok: true, token: mockToken });
    });

    it("returns 400 when start is missing", async () => {
      const res = await GET(makeRequest({ end: defaultParams.end }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body).toEqual({ error: "Missing required params: start, end" });
      expect(mockFetchDB).not.toHaveBeenCalled();
    });

    it("returns 400 when end is missing", async () => {
      const res = await GET(makeRequest({ start: defaultParams.start }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body).toEqual({ error: "Missing required params: start, end" });
      expect(mockFetchDB).not.toHaveBeenCalled();
    });

    it("returns 400 when both start and end are missing", async () => {
      const res = await GET(makeRequest({}));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body).toEqual({ error: "Missing required params: start, end" });
      expect(mockFetchDB).not.toHaveBeenCalled();
    });
  });

  describe("when authenticated as admin with valid params", () => {
    beforeEach(() => {
      mockRequireAdmin.mockResolvedValue({ ok: true, token: mockToken });
    });

    it("calls fetchDB with the correct path and params", async () => {
      mockFetchDB.mockResolvedValue({ admin_recordings: [] });

      await GET(makeRequest(defaultParams));

      expect(mockFetchDB).toHaveBeenCalledWith("/admin/map", {
        start: defaultParams.start,
        end: defaultParams.end,
      });
    });

    it("returns camelCased recordings array on success", async () => {
      mockFetchDB.mockResolvedValue({ admin_recordings: [sampleRecording] });

      const res = await GET(makeRequest(defaultParams));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual(toCamelCase([sampleRecording]));
      expect(body[0]).toEqual(
        expect.objectContaining({
          vesselId: 1,
          id: 5,
          name: "AL-cra-2026-5",
          tripId: "5",
          tripName: "TRP-2026-5",
          hasTranscript: true,
          hasVideo: true,
          hasAudio: true,
        })
      );
    });

    it("returns an empty array when there are no recordings", async () => {
      mockFetchDB.mockResolvedValue({ admin_recordings: [] });

      const res = await GET(makeRequest(defaultParams));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual([]);
    });

    it("returns an empty array when admin_recordings is null/undefined", async () => {
      mockFetchDB.mockResolvedValue({ admin_recordings: null });

      const res = await GET(makeRequest(defaultParams));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual([]);
    });

    it("returns 500 when fetchDB throws", async () => {
      mockFetchDB.mockRejectedValue(new Error("DB error"));

      const res = await GET(makeRequest(defaultParams));
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: "Failed to fetch map data" });
    });
  });
});
