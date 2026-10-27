import { NextRequest } from "next/server";
import { GET } from "@/app/api/fisher/map/route";
import { fetchDB } from "@/_lib/database/client";
import { requireFisher } from "@/_lib/api/route-helpers";

jest.mock("@/_lib/database/client", () => ({
  fetchDB: jest.fn(),
}));

jest.mock("@/_lib/api/route-helpers", () => ({
  requireFisher: jest.fn(),
}));

const mockRequireFisher = requireFisher as jest.MockedFunction<typeof requireFisher>;
const mockFetchDB = fetchDB as jest.MockedFunction<typeof fetchDB>;

function makeRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL("http://localhost/api/fisher/map");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return new NextRequest(url);
}

const defaultParams = {
  start: "2025-01-01T00:00:00.000Z",
  end: "2026-01-01T00:00:00.000Z",
};
const mockToken = { role: "fisher", vesselId: "42" };

describe("GET /api/fisher/map", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("auth", () => {
    it("returns 401 when not authenticated", async () => {
      mockRequireFisher.mockResolvedValue({
        ok: false,
        response: Response.json({ error: "Unauthorised" }, { status: 401 }),
      });

      const res = await GET(makeRequest(defaultParams));

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "Unauthorised" });
    });

    it("returns 403 when authenticated but not fisher", async () => {
      mockRequireFisher.mockResolvedValue({
        ok: false,
        response: Response.json({ error: "Forbidden" }, { status: 403 }),
      });

      const res = await GET(makeRequest(defaultParams));

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: "Forbidden" });
    });
  });

  describe("param validation", () => {
    beforeEach(() => {
      mockRequireFisher.mockResolvedValue({ ok: true, token: mockToken });
    });

    it("returns 400 when start is missing", async () => {
      const res = await GET(makeRequest({ end: defaultParams.end }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body).toEqual({ error: "Missing required params: start, end" });
    });

    it("returns 400 when end is missing", async () => {
      const res = await GET(makeRequest({ start: defaultParams.start }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body).toEqual({ error: "Missing required params: start, end" });
    });

    it("returns 400 when both start and end are missing", async () => {
      const res = await GET(makeRequest());
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body).toEqual({ error: "Missing required params: start, end" });
    });
  });

  describe("when authenticated as fisher", () => {
    beforeEach(() => {
      mockRequireFisher.mockResolvedValue({ ok: true, token: mockToken });
    });

    it("returns alerts in camelCase on success", async () => {
      mockFetchDB.mockResolvedValue({
        recordings: [
          {
            id: 1,
            name: "Alert One",
            start: "2025-06-01T00:00:00Z",
            end: "2025-06-01T01:00:00Z",
            latitude: 50.1,
            longitude: -1.4,
            trip_name: "Trip A",
            trip_id: 10,
            video_file_ids: ["v1"],
            audio_file_ids: ["a1"],
            transcript_file_ids: ["t1"],
            species_detected: ["dolphin"],
          },
        ],
      });

      const res = await GET(makeRequest(defaultParams));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual([
        {
          id: 1,
          name: "Alert One",
          start: "2025-06-01T00:00:00Z",
          end: "2025-06-01T01:00:00Z",
          latitude: 50.1,
          longitude: -1.4,
          tripName: "Trip A",
          tripId: 10,
          videoFileIds: ["v1"],
          audioFileIds: ["a1"],
          transcriptFileIds: ["t1"],
          speciesDetected: ["dolphin"],
        },
      ]);
    });

    it("returns empty array when no recordings exist", async () => {
      mockFetchDB.mockResolvedValue({ recordings: [] });

      const res = await GET(makeRequest(defaultParams));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual([]);
    });

    it("passes start and end to fetchDB", async () => {
      mockFetchDB.mockResolvedValue({ recordings: [] });

      await GET(makeRequest(defaultParams));

      expect(mockFetchDB).toHaveBeenCalledWith("/fisher/map", {
        start: defaultParams.start,
        end: defaultParams.end,
      });
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
