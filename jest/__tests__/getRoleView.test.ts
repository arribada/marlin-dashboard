import { getRoleView } from '@/_lib/getRoleView';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { ComponentType } from 'react';
import { RoleViewProps } from '@/_types/roles';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/_lib/authOptions', () => ({
  authOptions: {},
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

const AdminView = () => null;
const FisherView = () => null;
const AnalystView = () => null;

const allRoleViews: Record<string, ComponentType<RoleViewProps>> = {
  admin: AdminView,
  fisher: FisherView,
  analyst: AnalystView,
};

const mockSession = (role: string | undefined) => {
  mockGetServerSession.mockResolvedValue(
    role ? { user: { role }, expires: '' } : null
  );
};

describe('getRoleView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Role Matching', () => {
    it('should return the admin view for an admin session', async () => {
      mockSession('admin');
      const View = await getRoleView(allRoleViews);
      expect(View).toBe(AdminView);
    });

    it('should return the fisher view for a fisher session', async () => {
      mockSession('fisher');
      const View = await getRoleView(allRoleViews);
      expect(View).toBe(FisherView);
    });

    it('should return the analyst view for an analyst session', async () => {
      mockSession('analyst');
      const View = await getRoleView(allRoleViews);
      expect(View).toBe(AnalystView);
    });

    it('should not redirect when a valid role matches a view', async () => {
      mockSession('admin');
      await getRoleView(allRoleViews);
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('Redirects', () => {
    it('should redirect to /login when there is no session', async () => {
      mockSession(undefined);
      await getRoleView(allRoleViews);
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    it('should redirect to /dashboard when the session has no role', async () => {
      mockGetServerSession.mockResolvedValue({ user: {}, expires: '' } as any);
      await getRoleView(allRoleViews);
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
    });

    it('should redirect to /dashboard when the role is not in the provided roleViews map', async () => {
      mockSession('superadmin');
      await getRoleView(allRoleViews);
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
    });

    it('should redirect to /dashboard when roleViews is an empty map', async () => {
      mockSession('admin');
      await getRoleView({});
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
    });
  });

  // TripDetails is only registered for admin + fisher
  // Analysts are deliberately excluded and redirected.
  describe('Role-Based Access Control', () => {
    const tripDetailsViews: Record<string, ComponentType<RoleViewProps>> = {
      admin: AdminView,
      fisher: FisherView,
      // analyst intentionally omitted — analysts have no access to trip details
    };

    it('should return the admin view for trip details', async () => {
      mockSession('admin');
      const View = await getRoleView(tripDetailsViews);
      expect(View).toBe(AdminView);
    });

    it('should return the fisher view for trip details', async () => {
      mockSession('fisher');
      const View = await getRoleView(tripDetailsViews);
      expect(View).toBe(FisherView);
    });

    it('should redirect an analyst away from trip details', async () => {
      mockSession('analyst');
      await getRoleView(tripDetailsViews);
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Session Handling', () => {
    it('should call getServerSession with authOptions', async () => {
      mockSession('admin');
      await getRoleView(allRoleViews);
      expect(mockGetServerSession).toHaveBeenCalledWith(
        expect.objectContaining({}) // authOptions — content is mocked but call is verified
      );
    });

    it('should call getServerSession exactly once per invocation', async () => {
      mockSession('admin');
      await getRoleView(allRoleViews);
      expect(mockGetServerSession).toHaveBeenCalledTimes(1);
    });
  });
});
