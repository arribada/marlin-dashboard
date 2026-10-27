import { GET } from '@/app/api/admin/trip-history/route';
import { NextRequest } from 'next/server';

jest.mock("@/_lib/database/client", () => ({
  fetchDB: jest.fn(),
}));

jest.mock("@/_lib/api/route-helpers", () => ({
  requireAdmin: jest.fn(),
}));

import { fetchDB } from "@/_lib/database/client";
import { requireAdmin } from "@/_lib/api/route-helpers";

const mockFetchDB = fetchDB as jest.MockedFunction<typeof fetchDB>;
const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>;

describe('GET /api/admin/trip-history', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: caller is an admin
    mockRequireAdmin.mockResolvedValue({ ok: true } as any);
  });

  it('returns 200 and trip data for valid admin with vessel ID', async () => {
    mockFetchDB.mockResolvedValueOnce({
      admin_trip_history: [
        {
          name: 'TRP-2025-001',
          start: '2025-10-05 05:45',
          bycatch_event_count: 2,
          alert_count: 1,
        },
      ],
    } as any);

    const mockRequest = new NextRequest(
      new URL('http://localhost:3000/api/admin/trip-history?v=vessel-123')
    );

    const res = await GET(mockRequest);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0]).toHaveProperty('name', 'TRP-2025-001');
    expect(body[0]).toHaveProperty('start', '2025-10-05 05:45');
    expect(body[0]).toHaveProperty('bycatchEventCount', 2);
    expect(body[0]).toHaveProperty('alertCount', 1);

    expect(mockFetchDB).toHaveBeenCalledWith('/admin/trip-history', { vessel_id: 'vessel-123' });
  });

  it('returns 403 if user is not an admin', async () => {
    mockRequireAdmin.mockResolvedValueOnce({
      ok: false,
      response: Response.json(
        { error: '[admin/trip-history API - checkRole] Forbidden' },
        { status: 403 }
      ),
    } as any);

    const mockRequest = new NextRequest(
      new URL('http://localhost:3000/api/admin/trip-history?v=vessel-123')
    );

    const res = await GET(mockRequest);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body).toEqual({ error: '[admin/trip-history API - checkRole] Forbidden' });
    expect(mockFetchDB).not.toHaveBeenCalled();
  });

  it('returns 400 if vessel ID parameter is missing', async () => {
    const mockRequest = new NextRequest(
      new URL('http://localhost:3000/api/admin/trip-history')
    );

    const res = await GET(mockRequest);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: '[admin/trip-history API] Missing vessel ID' });
    expect(mockFetchDB).not.toHaveBeenCalled();
  });

  it('returns 500 if the DB request fails', async () => {
    mockFetchDB.mockRejectedValueOnce(new Error('Database error'));

    const mockRequest = new NextRequest(
      new URL('http://localhost:3000/api/admin/trip-history?v=vessel-123')
    );

    const res = await GET(mockRequest);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to fetch trip history data' });
  });
});
