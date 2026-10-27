import { NextRequest } from "next/server";
import { GET } from "@/app/api/fisher/trip-details/route";
import { fetchDB } from "@/_lib/database/client";
import { requireFisher } from "@/_lib/api/route-helpers";
import { extractVesselId } from "@/_lib/api/route-helpers";

jest.mock("@/_lib/database/client", () => ({
  fetchDB: jest.fn(),
}));

jest.mock("@/_lib/api/route-helpers", () => ({
  requireFisher: jest.fn(),
  extractVesselId: jest.fn(),
}));

const mockFetchDB = fetchDB as jest.MockedFunction<typeof fetchDB>;
const mockRequireFisher = requireFisher as jest.MockedFunction<typeof requireFisher>;
const mockExtractVesselId = extractVesselId as jest.MockedFunction<typeof extractVesselId>;

const mockToken = { role: "fisher", vesselId: "17cb945d-d450" };

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

describe("GET /api/fisher/trip-details", () => {
  const mockReq = new NextRequest("http://localhost/api/fisher/trip-details?trip=TRP-2025-001");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the auth response when requireFisher fails", async () => {
    mockRequireFisher.mockResolvedValue({
      ok: false,
      response: Response.json({ error: "Unauthorised" }, { status: 401 }),
    });

    const res = await GET(mockReq);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorised" });
    expect(mockFetchDB).not.toHaveBeenCalled();
  });

  it("returns the extractVesselId response when vesselId extraction fails", async () => {
    mockRequireFisher.mockResolvedValue({ ok: true, token: mockToken });
    mockExtractVesselId.mockReturnValue(
      Response.json({ error: "No vessel ID on token" }, { status: 403 })
    );

    const res = await GET(mockReq);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body).toEqual({ error: "No vessel ID on token" });
    expect(mockFetchDB).not.toHaveBeenCalled();
  });

  it("returns 400 if trip name is missing", async () => {
    mockRequireFisher.mockResolvedValue({ ok: true, token: mockToken });
    mockExtractVesselId.mockReturnValue("17cb945d-d450");

    const reqNoTrip = new NextRequest("http://localhost/api/fisher/trip-details");
    const res = await GET(reqNoTrip);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "[fisher/trip-details API] No trip name provided" });
  });

  it("returns 500 if the DB request fails", async () => {
    mockRequireFisher.mockResolvedValue({ ok: true, token: mockToken });
    mockExtractVesselId.mockReturnValue("17cb945d-d450");
    mockFetchDB.mockRejectedValueOnce(new Error("DB connection failed"));

    const res = await GET(mockReq);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: "Failed to fetch trip data" });
  });

  it("returns 403 if the returned trip's vesselId doesn't match the caller's", async () => {
    mockRequireFisher.mockResolvedValue({ ok: true, token: mockToken });
    mockExtractVesselId.mockReturnValue("17cb945d-d450");
    mockFetchDB.mockResolvedValueOnce({
      trip_details: { ...mockTripDetails, vessel_id: "some-other-vessel" },
    });

    const res = await GET(mockReq);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 200 and trip data for a valid fisher request", async () => {
    mockRequireFisher.mockResolvedValue({ ok: true, token: mockToken });
    mockExtractVesselId.mockReturnValue("17cb945d-d450");
    mockFetchDB.mockResolvedValueOnce({ trip_details: mockTripDetails });

    const res = await GET(mockReq);
    const body = await res.json();

    expect(res.status).toBe(200);

    expect(body).toHaveProperty("start", "2025-10-05 05:45");
    expect(body).toHaveProperty("end", "2025-10-05 19:15");
    expect(body).toHaveProperty("duration", "13h 30m");
    expect(body).toHaveProperty("location", "50.37°N, 4.14°W");
    expect(body).toHaveProperty("vesselId", "17cb945d-d450");
    expect(body).toHaveProperty("vesselName", "Sea Explorer");
    expect(body).toHaveProperty("vesselRegistration", "REG-12345");
    expect(body).toHaveProperty("bycatchEvents");

    expect(mockFetchDB).toHaveBeenCalledWith("/fisher/trip-details", {
      vessel_id: "17cb945d-d450",
      name: "TRP-2025-001",
    });
  });

  it("tags recordings as bycatch or alert based on speciesDetected", async () => {
    mockRequireFisher.mockResolvedValue({ ok: true, token: mockToken });
    mockExtractVesselId.mockReturnValue("17cb945d-d450");
    mockFetchDB.mockResolvedValueOnce({
      trip_details: {
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
      mockRequireFisher.mockResolvedValue({ ok: true, token: mockToken });
      mockExtractVesselId.mockReturnValue("17cb945d-d450");
      mockFetchDB.mockResolvedValueOnce({ trip_details: mockTripDetails });

      const reqWithWindow = new NextRequest(
        "http://localhost/api/fisher/trip-details?trip=TRP-2025-001&start=2026-06-17T15%3A46%3A39.000Z&end=2026-06-17T17%3A22%3A51.000Z"
      );

      const res = await GET(reqWithWindow);

      expect(res.status).toBe(200);
      expect(mockFetchDB).toHaveBeenCalledWith("/fisher/trip-details", {
        vessel_id: "17cb945d-d450",
        name: "TRP-2025-001",
        start: "2026-06-17T15:46:39.000Z",
        end: "2026-06-17T17:22:51.000Z",
      });
    });

    it("omits start and end when only start is provided", async () => {
      mockRequireFisher.mockResolvedValue({ ok: true, token: mockToken });
      mockExtractVesselId.mockReturnValue("17cb945d-d450");
      mockFetchDB.mockResolvedValueOnce({ trip_details: mockTripDetails });

      const reqStartOnly = new NextRequest(
        "http://localhost/api/fisher/trip-details?trip=TRP-2025-001&start=2026-06-17T15%3A46%3A39.000Z"
      );

      const res = await GET(reqStartOnly);

      expect(res.status).toBe(200);
      expect(mockFetchDB).toHaveBeenCalledWith("/fisher/trip-details", {
        vessel_id: "17cb945d-d450",
        name: "TRP-2025-001",
      });
    });

    it("omits start and end when only end is provided", async () => {
      mockRequireFisher.mockResolvedValue({ ok: true, token: mockToken });
      mockExtractVesselId.mockReturnValue("17cb945d-d450");
      mockFetchDB.mockResolvedValueOnce({ trip_details: mockTripDetails });

      const reqEndOnly = new NextRequest(
        "http://localhost/api/fisher/trip-details?trip=TRP-2025-001&end=2026-06-17T17%3A22%3A51.000Z"
      );

      const res = await GET(reqEndOnly);

      expect(res.status).toBe(200);
      expect(mockFetchDB).toHaveBeenCalledWith("/fisher/trip-details", {
        vessel_id: "17cb945d-d450",
        name: "TRP-2025-001",
      });
    });
  });

  describe("data source", () => {
    beforeEach(() => {
      mockRequireFisher.mockResolvedValue({ ok: true, token: mockToken });
      mockExtractVesselId.mockReturnValue("17cb945d-d450");
      mockFetchDB.mockResolvedValueOnce({ trip_details: mockTripDetails });
    });

    it("queries the alt endpoint when source=mobile", async () => {
      const req = new NextRequest("http://localhost/api/fisher/trip-details?trip=TRP-2025-001&source=mobile");

      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(mockFetchDB).toHaveBeenCalledWith("/fisher/alt-trip-details", {
        vessel_id: "17cb945d-d450",
        name: "TRP-2025-001",
      });
    });

    it("queries the default endpoint when source=cls", async () => {
      const req = new NextRequest("http://localhost/api/fisher/trip-details?trip=TRP-2025-001&source=cls");

      await GET(req);

      expect(mockFetchDB).toHaveBeenCalledWith("/fisher/trip-details", expect.any(Object));
    });

    it("falls back to the default endpoint for an unknown source", async () => {
      const req = new NextRequest("http://localhost/api/fisher/trip-details?trip=TRP-2025-001&source=../admin");

      await GET(req);

      expect(mockFetchDB).toHaveBeenCalledWith("/fisher/trip-details", expect.any(Object));
    });
  });
});
