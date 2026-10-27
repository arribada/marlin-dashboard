import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/trip-details/route';
import { fetchDB } from '@/_lib/database/client';
import { requireAdmin } from '@/_lib/api/route-helpers';

jest.mock("@/_lib/database/client", () => ({
  fetchDB: jest.fn(),
}));

jest.mock("@/_lib/api/route-helpers", () => ({
  requireAdmin: jest.fn(),
}));

const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>;

const mockFetchDB = fetchDB as jest.MockedFunction<typeof fetchDB>;

const mockTripDetails = {
  start: "2025-10-05 05:45",
  end: "2025-10-05 19:15",
  duration: "13h 30m",
  location: "50.37°N, 4.14°W",
  vessel_id: "17cb945d-d450",
  vessel_name: "Sea Explorer",
  vessel_registration: "REG-12345",
  bycatch_events: 2,
  recordings: [],
};

describe('GET /api/admin/trip-details', () => {
  const mockReq = new NextRequest('http://localhost/api/admin/trip-details?trip=TRP-2025-001');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 403 if user is not admin", async () => {
    mockRequireAdmin.mockResolvedValueOnce({
      ok: false,
      response: Response.json({ error: "[GET /api/admin/trip-details - checkRole] Forbidden" }, { status: 403 }),
    });

    const res = await GET(mockReq);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body).toEqual({ error: "[GET /api/admin/trip-details - checkRole] Forbidden" });
  });

  it("returns 400 if trip ID is missing", async () => {
    mockRequireAdmin.mockResolvedValueOnce({ ok: true, token: { role: "admin" } });

    const reqNoTrip = new NextRequest('http://localhost/api/admin/trip-details');
    const res = await GET(reqNoTrip);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "[admin/trip-details API] No trip ID provided" });
  });

  it("returns 500 if DB query fails", async () => {
    mockRequireAdmin.mockResolvedValueOnce({ ok: true, token: { role: "admin" } });
    mockFetchDB.mockRejectedValueOnce(new Error("DB connection failed"));

    const res = await GET(mockReq);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: "Failed to fetch trip data" });
  });

  it("returns 200 and trip data if user is admin with valid token and trip name", async () => {
    mockRequireAdmin.mockResolvedValueOnce({
      ok: true,
      token: { role: "admin", vesselId: "17cb945d-d450" },
    });

    mockFetchDB.mockResolvedValueOnce({ admin_trip_details: mockTripDetails });

    const res = await GET(mockReq);
    const body = await res.json();

    expect(res.status).toBe(200);

    // Checks data items have the expected keys in camelCase
    expect(body).toHaveProperty("start", "2025-10-05 05:45");
    expect(body).toHaveProperty("end", "2025-10-05 19:15");
    expect(body).toHaveProperty("duration", "13h 30m");
    expect(body).toHaveProperty("location", "50.37°N, 4.14°W");
    expect(body).toHaveProperty("vesselId", "17cb945d-d450");
    expect(body).toHaveProperty("vesselName", "Sea Explorer");
    expect(body).toHaveProperty("vesselRegistration", "REG-12345");
    expect(body).toHaveProperty("bycatchEvents");

    // Ensure fetchDB is called with the correct path and params.
    // No start/end on the request, so they should be omitted entirely
    // rather than forwarded as undefined.
    expect(mockFetchDB).toHaveBeenCalledWith("/admin/trip-details", { trip_id: "TRP-2025-001" });
  });

  it("tags recordings as bycatch or alert based on speciesDetected", async () => {
    mockRequireAdmin.mockResolvedValueOnce({
      ok: true,
      token: { role: "admin", vesselId: "17cb945d-d450" },
    });

    mockFetchDB.mockResolvedValueOnce({
      admin_trip_details: {
        ...mockTripDetails,
        recordings: [
          { name: "cra-2026-1", species_detected: null },
          { name: "cra-2026-2", species_detected: ["dolphin", "turtle"] },
        ],
      },
    });

    const res = await GET(mockReq);
    const body = await res.json();

    expect(body.recordings).toEqual([
      expect.objectContaining({ name: "cra-2026-1", type: "alert" }),
      expect.objectContaining({ name: "cra-2026-2", type: "bycatch" }),
    ]);
  });

  describe("start/end query params", () => {
    it("forwards start and end to fetchDB when both are provided", async () => {
      mockRequireAdmin.mockResolvedValueOnce({
        ok: true,
        token: { role: "admin", vesselId: "17cb945d-d450" },
      });
      mockFetchDB.mockResolvedValueOnce({ admin_trip_details: mockTripDetails });

      const reqWithWindow = new NextRequest(
        'http://localhost/api/admin/trip-details?trip=TRP-2025-001&start=2026-06-17T15%3A46%3A39.000Z&end=2026-06-17T17%3A22%3A51.000Z'
      );

      const res = await GET(reqWithWindow);

      expect(res.status).toBe(200);
      expect(mockFetchDB).toHaveBeenCalledWith("/admin/trip-details", {
        trip_id: "TRP-2025-001",
        start: "2026-06-17T15:46:39.000Z",
        end: "2026-06-17T17:22:51.000Z",
      });
    });

    it("omits start and end when only start is provided", async () => {
      mockRequireAdmin.mockResolvedValueOnce({
        ok: true,
        token: { role: "admin", vesselId: "17cb945d-d450" },
      });
      mockFetchDB.mockResolvedValueOnce({ admin_trip_details: mockTripDetails });

      const reqStartOnly = new NextRequest(
        'http://localhost/api/admin/trip-details?trip=TRP-2025-001&start=2026-06-17T15%3A46%3A39.000Z'
      );

      const res = await GET(reqStartOnly);

      expect(res.status).toBe(200);
      expect(mockFetchDB).toHaveBeenCalledWith("/admin/trip-details", { trip_id: "TRP-2025-001" });
    });

    it("omits start and end when only end is provided", async () => {
      mockRequireAdmin.mockResolvedValueOnce({
        ok: true,
        token: { role: "admin", vesselId: "17cb945d-d450" },
      });
      mockFetchDB.mockResolvedValueOnce({ admin_trip_details: mockTripDetails });

      const reqEndOnly = new NextRequest(
        'http://localhost/api/admin/trip-details?trip=TRP-2025-001&end=2026-06-17T17%3A22%3A51.000Z'
      );

      const res = await GET(reqEndOnly);

      expect(res.status).toBe(200);
      expect(mockFetchDB).toHaveBeenCalledWith("/admin/trip-details", { trip_id: "TRP-2025-001" });
    });
  });
});
