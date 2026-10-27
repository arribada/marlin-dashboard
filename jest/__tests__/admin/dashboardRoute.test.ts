import { GET } from "@/app/api/admin/dashboard/route";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/_lib/api/route-helpers";
import { fetchDB } from "@/_lib/database/client";
import { supabaseServer } from "@/_lib/supabase/server";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/_lib/api/route-helpers", () => ({ requireAdmin: jest.fn() }));
jest.mock("@/_lib/database/client", () => ({ fetchDB: jest.fn() }));
jest.mock("@/_utils/formatting", () => ({ toCamelCase: jest.fn((d) => d) }));
jest.mock("@/_lib/supabase/server", () => ({ supabaseServer: { from: jest.fn() } }));

const mockRequireAdmin = requireAdmin as jest.Mock;
const mockFetchDB = fetchDB as jest.MockedFunction<typeof fetchDB>;
const mockFrom = supabaseServer.from as jest.Mock;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockAuthOk() {
  mockRequireAdmin.mockResolvedValue({ ok: true, token: { sub: "user-1" } });
}

function mockAuthFail(status: 401 | 403) {
  mockRequireAdmin.mockResolvedValue({
    ok: false,
    response: NextResponse.json(
      { error: status === 401 ? "Unauthorised" : "Forbidden" },
      { status }
    ),
  });
}

function makeRequest() {
  return new NextRequest(new URL("http://localhost/api/admin/dashboard"));
}

const adminVessels = [
  {
    id: 1,
    name: "Ocean Explorer",
    registration: "OE-001",
    lastPosition: { time: "2025-01-15T10:00:00Z", latitude: 37.77, longitude: -122.41 },
    lastRecording: { type: "alert", time: "2025-01-15T10:00:00Z" },
  },
];

// Used to alternate responses for the "alerts" table
// (first call = recent alerts, second call = recent bycatch)
let alertsCallCount = 0;

function mockDbOk() {
  alertsCallCount = 0;

  mockFetchDB.mockResolvedValue({ admin_vessels: adminVessels });

  mockFrom.mockImplementation((table: string) => {
    if (table === "admin_dashboard_trips") {
      return {
        select: jest.fn().mockResolvedValue({
          data: [{ date: "2025-01-15", events: 3 }],
          error: null,
        }),
      };
    }

    if (table === "admin_dashboard_alerts") {
      return {
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { total_alerts: 7 },
          error: null,
        }),
      };
    }

    if (table === "alerts") {
      const data =
        alertsCallCount++ % 2 === 0
          ? [{ id: "a1", time: "2025-01-15T10:00:00Z", vessels: { name: "Ocean Explorer" } }]
          : [{ id: "b1", time: "2025-01-16T09:00:00Z", vessels: { name: "Sea Navigator" } }];

      return {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data, error: null }),
      };
    }

    return { select: jest.fn() };
  });
}

function mockDbErrors() {
  alertsCallCount = 0;
  const dbError = { message: "db error" };

  mockFetchDB.mockRejectedValue(dbError);

  mockFrom.mockImplementation((table: string) => {
    if (table === "admin_dashboard_trips") {
      return { select: jest.fn().mockResolvedValue({ data: null, error: dbError }) };
    }

    if (table === "admin_dashboard_alerts") {
      return {
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: dbError }),
      };
    }

    if (table === "alerts") {
      return {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: null, error: dbError }),
      };
    }

    return { select: jest.fn() };
  });
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  mockAuthOk();
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore?.();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/admin/dashboard", () => {

  describe("authentication", () => {
    it("returns 401 if unauthorised", async () => {
      mockAuthFail(401);

      const res = await GET(makeRequest());

      expect(res.status).toBe(401);
    });

    it("returns 403 if forbidden", async () => {
      mockAuthFail(403);

      const res = await GET(makeRequest());

      expect(res.status).toBe(403);
    });
  });

  describe("success", () => {
    beforeEach(() => mockDbOk());

    it("returns vessel count", async () => {
      const res = await GET(makeRequest());
      const body = await res.json();
      expect(body.vessels).toBe(1);
    });

    it("returns mapped trips", async () => {
      const res = await GET(makeRequest());
      const body = await res.json();
      expect(body.trips).toEqual([{ date: "2025-01-15", events: 3 }]);
    });

    it("returns alert count", async () => {
      const res = await GET(makeRequest());
      const body = await res.json();
      expect(body.alerts).toBe(7);
    });

    it("returns mapped recent alerts", async () => {
      const res = await GET(makeRequest());
      const body = await res.json();
      expect(body.recentAlerts?.[0]).toMatchObject({
        id: "a1",
        type: "alert",
        vesselName: "Ocean Explorer",
      });
    });

    it("returns mapped recent bycatch", async () => {
      const res = await GET(makeRequest());
      const body = await res.json();
      expect(body.recentBycatch?.[0]).toMatchObject({
        id: "b1",
        type: "bycatch",
      });
    });

    it("returns recent vessel locations", async () => {
      const res = await GET(makeRequest());
      const body = await res.json();
      expect(body.recentVesselLocations?.[0]).toMatchObject({
        id: 1,
        name: "Ocean Explorer",
        location: { latitude: 37.77, longitude: -122.41 },
      });
    });

    it("returns empty errors", async () => {
      const res = await GET(makeRequest());
      const body = await res.json();
      expect(body.errors).toEqual({});
    });
  });

  describe("errors", () => {
    beforeEach(() => mockDbErrors());

    it("returns null vessels and sets vessels + recentVesselLocations error keys", async () => {
      const res = await GET(makeRequest());
      const body = await res.json();
      expect(body.vessels).toBeNull();
      expect(body.recentVesselLocations).toBeNull();
      expect(body.errors.vessels).toBeDefined();
    });

    it("returns null trips and sets error key", async () => {
      const res = await GET(makeRequest());
      const body = await res.json();
      expect(body.trips).toBeNull();
      expect(body.errors.trips).toBeDefined();
    });

    it("returns null alerts and sets error key", async () => {
      const res = await GET(makeRequest());
      const body = await res.json();
      expect(body.alerts).toBeNull();
      expect(body.errors.alerts).toBeDefined();
    });

    it("returns null recentAlerts and null alertsByDate", async () => {
      const res = await GET(makeRequest());
      const body = await res.json();
      expect(body.recentAlerts).toBeNull();
      expect(body.alertsByDate).toBeNull();
    });

    it("returns null recentBycatch and null bycatchByDate", async () => {
      const res = await GET(makeRequest());
      const body = await res.json();
      expect(body.recentBycatch).toBeNull();
      expect(body.bycatchByDate).toBeNull();
    });
  });
});
