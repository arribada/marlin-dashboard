import { authOptions } from '../../../src/_lib/authOptions';
import { headers } from 'next/headers';

// Mock all dependencies
jest.mock('../../../src/_lib/supabase/server', () => ({
  supabaseServer: {
    from: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('../../../src/_lib/supabase/loginRateLimiter', () => ({
  checkLoginRateLimit: jest.fn(),
}));

jest.mock('../../../src/_lib/recaptcha', () => ({
  verifyRecaptcha: jest.fn(),
}));

jest.mock('../../../src/_utils/validateEnvVar', () => ({
  __esModule: true,
  default: jest.fn((varName: string, type: string) => {
    if (varName === 'NEXTAUTH_SESSION_MAX_AGE') return 3600;
    if (varName === 'NEXTAUTH_ADMIN_SESSION_MAX_AGE') return 7200;
    return 'mock-value';
  }),
}));

describe('authOptions', () => {
  const mockHeaders = headers as jest.MockedFunction<typeof headers>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for headers
    mockHeaders.mockResolvedValue({
      get: jest.fn().mockReturnValue('192.168.1.1'),
    } as any);
  });

  describe('callbacks', () => {
    describe('redirect callback', () => {
      const redirectCallback = authOptions.callbacks!.redirect!;

      it('should handle relative URLs', async () => {
        const result = await redirectCallback({
          url: '/dashboard',
          baseUrl: 'https://example.com',
        });

        expect(result).toBe('https://example.com/dashboard');
      });

      it('should handle absolute URLs with same origin', async () => {
        const result = await redirectCallback({
          url: 'https://example.com/profile',
          baseUrl: 'https://example.com',
        });

        expect(result).toBe('https://example.com/profile');
      });

      it('should redirect to baseUrl for different origins', async () => {
        const result = await redirectCallback({
          url: 'https://malicious.com/steal',
          baseUrl: 'https://example.com',
        });

        expect(result).toBe('https://example.com');
      });

      it('should use localhost as fallback when baseUrl is missing', async () => {
        const result = await redirectCallback({
          url: '/dashboard',
          baseUrl: '',
        });

        expect(result).toBe('http://localhost:3000/dashboard');
      });
    });

    describe('jwt callback', () => {
      const jwtCallback = authOptions.callbacks!.jwt!;

      it('should populate token with user data for new sessions', async () => {
        const mockUser = {
          id: 'user-123',
          name: 'John Doe',
          email: 'test@example.com',
          role: 'fisher',
          vesselId: 'vessel-456',
          sessionId: 'session-789',
        };

        const token = {};
        const now = Math.floor(Date.now() / 1000);

        const result = await jwtCallback({
          token,
          user: mockUser as any,
        } as any);

        expect(result.id).toBe('user-123');
        expect(result.name).toBe('John Doe');
        expect(result.role).toBe('fisher');
        expect(result.vesselId).toBe('vessel-456');
        expect(result.sessionId).toBe('session-789');
        expect(result.exp).toBeGreaterThanOrEqual(now + 3600);
      });

      it('should set longer expiry for admin users', async () => {
        const mockAdmin = {
          id: 'admin-123',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          vesselId: null,
          sessionId: 'session-abc',
        };

        const token = {};
        const now = Math.floor(Date.now() / 1000);

        const result = await jwtCallback({
          token,
          user: mockAdmin as any,
        } as any);

        expect(result.exp).toBeGreaterThanOrEqual(now + 7200);
      });

      it('should handle null vesselId', async () => {
        const mockUser = {
          id: 'analyst-123',
          name: 'Analyst User',
          email: 'analyst@example.com',
          role: 'analyst',
          vesselId: undefined,
          sessionId: 'session-xyz',
        };

        const token = {};

        const result = await jwtCallback({
          token,
          user: mockUser as any,
        } as any);

        expect(result.vesselId).toBeNull();
      });

      it('should return existing token when no user is provided', async () => {
        const existingToken = {
          id: 'user-123',
          name: 'Existing User',
          role: 'fisher',
          exp: 1234567890,
        };

        const result = await jwtCallback({
          token: existingToken,
        } as any);

        expect(result).toEqual(existingToken);
      });
    });

    describe('session callback', () => {
      const sessionCallback = authOptions.callbacks!.session!;

      it('should populate session with token data', async () => {
        const mockSession = {
          user: {
            email: 'test@example.com',
          },
          expires: '2025-12-31',
        };

        const mockToken = {
          id: 'user-123',
          sessionId: 'session-789',
          name: 'John Doe',
          role: 'fisher',
        };

        const result = await sessionCallback({
          session: mockSession as any,
          token: mockToken as any,
        } as any);

        // @ts-expect-error - Session type extended in next-auth.d.ts
        expect(result.id).toBe('session-789');
        // @ts-expect-error - Session type extended in next-auth.d.ts
        expect(result.user?.id).toBe('user-123');
        expect(result.user?.name).toBe('John Doe');
        // @ts-expect-error - Session type extended in next-auth.d.ts
        expect(result.user?.role).toBe('fisher');
      });

      it('should use default name when token name is missing', async () => {
        const mockSession = {
          user: {
            email: 'test@example.com',
          },
          expires: '2025-12-31',
        };

        const mockToken = {
          id: 'user-123',
          sessionId: 'session-789',
          name: null,
          role: 'fisher',
        };

        const result = await sessionCallback({
          session: mockSession as any,
          token: mockToken as any,
        } as any);

        expect(result.user?.name).toBe('No name available');
      });

      it('should use default role when token role is missing', async () => {
        const mockSession = {
          user: {
            email: 'test@example.com',
          },
          expires: '2025-12-31',
        };

        const mockToken = {
          id: 'user-123',
          sessionId: 'session-789',
          name: 'John Doe',
          role: undefined,
        };

        const result = await sessionCallback({
          session: mockSession as any,
          token: mockToken as any,
        } as any);

        // @ts-expect-error - Session type extended in next-auth.d.ts
        expect(result.user?.role).toBe('regular');
      });
    });
  });

  describe('configuration', () => {
    it('should have correct session strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have correct session maxAge', () => {
      expect(authOptions.session?.maxAge).toBe(3600);
    });

    it('should have correct jwt maxAge', () => {
      expect(authOptions.jwt?.maxAge).toBe(3600);
    });

    it('should have correct sign-in page', () => {
      expect(authOptions.pages?.signIn).toBe('/login');
    });

    it('should use credentials provider', () => {
      expect(authOptions.providers).toHaveLength(1);
      expect(authOptions.providers[0]).toHaveProperty('authorize');
    });
  });
});
