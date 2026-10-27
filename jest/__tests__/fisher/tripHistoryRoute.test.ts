import { NextRequest } from 'next/server';
import { GET } from '@/app/api/fisher/trip-history/route';

jest.mock("@/_lib/database/client", () => ({
  fetchDB: jest.fn(),
}));

jest.mock("@/_lib/api/route-helpers", () => ({
  requireFisher: jest.fn(),
  extractVesselId: jest.fn(),
}));

import { fetchDB } from "@/_lib/database/client";
import { requireFisher, extractVesselId } from "@/_lib/api/route-helpers";

const mockFetchDB = fetchDB as jest.MockedFunction<typeof fetchDB>;
const mockRequireFisher = requireFisher as jest.MockedFunction<typeof requireFisher>;
const mockExtractVesselId = extractVesselId as jest.MockedFunction<typeof extractVesselId>;

describe("GET /api/fisher/trip-history", () => {
  const mockReq = new NextRequest("http://localhost/api/fisher/trip-history");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 403 if user is not fisher", async () => {
    mockRequireFisher.mockResolvedValueOnce({
      ok: false,
      response: Response.json(
        { error: "[fisher/trip-history API - checkRole] Forbidden" },
        { status: 403 }
      ),
    });

    const res = await GET(mockReq);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body).toEqual({ error: "[fisher/trip-history API - checkRole] Forbidden" });
  });

  it("returns 403 if vesselId is missing", async () => {
    mockRequireFisher.mockResolvedValueOnce({ ok: true, token: { role: "fisher" } });
    mockExtractVesselId.mockReturnValueOnce(
      Response.json(
        { error: "[fisher/trip-history API - extractVesselId] Missing vessel ID" },
        { status: 403 }
      )
    );

    const res = await GET(mockReq);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body).toEqual({ error: "[fisher/trip-history API - extractVesselId] Missing vessel ID" });
  });

  it("returns 500 if DB request fails", async () => {
    mockRequireFisher.mockResolvedValueOnce({
      ok: true,
      token: { role: "fisher", vesselId: "17cb945d-d450" },
    });
    mockExtractVesselId.mockReturnValueOnce("17cb945d-d450");
    mockFetchDB.mockRejectedValueOnce(new Error("DB connection failed"));

    const res = await GET(mockReq);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: "Failed to fetch trip history data" });
  });

  it("returns 200 and data if user is fisher and has token", async () => {
    mockRequireFisher.mockResolvedValueOnce({
      ok: true,
      token: { role: "fisher", vesselId: "17cb945d-d450" },
    });
    mockExtractVesselId.mockReturnValueOnce("17cb945d-d450");
    mockFetchDB.mockResolvedValueOnce({
      trip_history: [
        {
          name: "TRP-2025-001",
          start: "2025-10-05 05:45",
          end: "2025-10-05 19:15",
          duration: "13h 30m",
          location: "50.37°N, 4.14°W",
          bycatch_event_count: 2,
        },
        {
          name: "TRP-2025-002",
          start: "2025-10-05 05:45",
          end: "2025-10-05 19:15",
          duration: "13h 30m",
          location: "50.35°N, 4.12°W",
          bycatch_event_count: 1,
        },
      ],
    });

    const res = await GET(mockReq);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(2);

    // Checks data items have the expected keys in camelCase
    expect(body[0]).toHaveProperty("name");
    expect(body[0]).toHaveProperty("start");
    expect(body[0]).toHaveProperty("end");
    expect(body[0]).toHaveProperty("duration");
    expect(body[0]).toHaveProperty("location");
    expect(body[0]).toHaveProperty("bycatchEventCount");

    // Ensure fetchDB was called with the correct params
    expect(mockFetchDB).toHaveBeenCalledWith("/fisher/trip-history", {
      vessel_id: "17cb945d-d450",
    });
  });
});
