import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  requireAdmin,
  requireFisher,
  requireAnalyst,
  parseFileIds,
  extractVesselId,
} from "../../src/_lib/api/route-helpers";

jest.mock("next-auth/jwt", () => ({ getToken: jest.fn() }));

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

function makeReq(url: string): NextRequest { return new NextRequest(url); }

const adminToken  = { role: "admin",   vesselId: "VESSEL-001" };
const fisherToken = { role: "fisher",  vesselId: "VESSEL-001" };
const analystToken = { role: "analyst", vesselId: "VESSEL-001" };
const TAG = "test/route";

// ─── requireAdmin ────────────────────────────────────────────────────────────

describe("requireAdmin", () => {
  it("returns 401 when no token", async () => {
    mockGetToken.mockResolvedValue(null);
    const result = await requireAdmin(makeReq("http://localhost/api/admin/files"), TAG);
    expect(result.ok).toBe(false);
    expect((result as any).response.status).toBe(401);
  });

  it("returns 403 when role is not admin", async () => {
    mockGetToken.mockResolvedValue(fisherToken as any);
    const result = await requireAdmin(makeReq("http://localhost/api/admin/files"), TAG);
    expect(result.ok).toBe(false);
    expect((result as any).response.status).toBe(403);
  });

  it("returns ok for valid admin token", async () => {
    mockGetToken.mockResolvedValue(adminToken as any);
    const result = await requireAdmin(makeReq("http://localhost/api/admin/files"), TAG);
    expect(result.ok).toBe(true);
  });
});

// ─── requireFisher ───────────────────────────────────────────────────────────

describe("requireFisher", () => {
  it("returns 401 when no token", async () => {
    mockGetToken.mockResolvedValue(null);
    const result = await requireFisher(makeReq("http://localhost/api/fisher/files"), TAG);
    expect(result.ok).toBe(false);
    expect((result as any).response.status).toBe(401);
  });

  it("returns 403 when role is not fisher", async () => {
    mockGetToken.mockResolvedValue(adminToken as any);
    const result = await requireFisher(makeReq("http://localhost/api/fisher/files"), TAG);
    expect(result.ok).toBe(false);
    expect((result as any).response.status).toBe(403);
  });

  it("returns ok with token for valid fisher", async () => {
    mockGetToken.mockResolvedValue(fisherToken as any);
    const result = await requireFisher(makeReq("http://localhost/api/fisher/files"), TAG);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.token.role).toBe("fisher");
    expect(result.token.vesselId).toBe("VESSEL-001");
  });
});

// ─── requireAnalyst ──────────────────────────────────────────────────────────

describe("requireAnalyst", () => {
  it("returns 401 when no token", async () => {
    mockGetToken.mockResolvedValue(null);
    const result = await requireAnalyst(makeReq("http://localhost/api/analyst/files"), TAG);
    expect(result.ok).toBe(false);
    expect((result as any).response.status).toBe(401);
  });

  it("returns 403 when role is not analyst", async () => {
    mockGetToken.mockResolvedValue(fisherToken as any);
    const result = await requireAnalyst(makeReq("http://localhost/api/analyst/files"), TAG);
    expect(result.ok).toBe(false);
    expect((result as any).response.status).toBe(403);
  });

  it("returns ok with token for valid analyst", async () => {
    mockGetToken.mockResolvedValue(analystToken as any);
    const result = await requireAnalyst(makeReq("http://localhost/api/analyst/files"), TAG);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.token.role).toBe("analyst");
    expect(result.token.vesselId).toBe("VESSEL-001");
  });
});

// ─── parseFileIds ────────────────────────────────────────────────────────────

describe("parseFileIds", () => {
  it("returns 400 when ids param is missing", () => {
    const result = parseFileIds(makeReq("http://localhost/api/files"), TAG);
    expect(result instanceof Response).toBe(true);
    expect((result as Response).status).toBe(400);
  });

  it("returns 400 when ids param is empty", () => {
    const result = parseFileIds(makeReq("http://localhost/api/files?ids="), TAG);
    expect(result instanceof Response).toBe(true);
    expect((result as Response).status).toBe(400);
  });

  it("returns parsed ids array on valid input", () => {
    const result = parseFileIds(makeReq("http://localhost/api/files?ids=A,B,C"), TAG);
    expect(result).toEqual(["A", "B", "C"]);
  });

  it("filters empty segments from ids param", () => {
    const result = parseFileIds(makeReq("http://localhost/api/files?ids=A,,B"), TAG);
    expect(result).toEqual(["A", "B"]);
  });
});

// ─── extractVesselId ─────────────────────────────────────────────────────────

describe("extractVesselId", () => {
  it("returns 403 when token has no vesselId", () => {
    const result = extractVesselId({ role: "fisher" }, TAG);
    expect(result instanceof Response).toBe(true);
    expect((result as Response).status).toBe(403);
  });

  it("returns vesselId string when present in token", () => {
    const result = extractVesselId(fisherToken, TAG);
    expect(result).toBe("VESSEL-001");
  });
});
