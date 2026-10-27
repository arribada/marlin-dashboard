import { authOptions } from "@/_lib/authOptions";
import { fisherUser, adminUser } from "../../__mocks__/mockUsers";

describe("JWT callback: session duration", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2025-01-01T00:00:00Z"));
  });

  it("sets correct expiry for admin role", async () => {
    if (!authOptions.callbacks?.jwt) throw new Error("JWT callback not defined");
    const token = await authOptions.callbacks.jwt({
      token: {},
      user: adminUser,
      account: null,
    });
    const expectedExpiry = Math.floor(Date.now() / 1000) + Number(process.env.NEXTAUTH_ADMIN_SESSION_MAX_AGE);
    expect(token.exp).toBe(expectedExpiry);
  });

  it("sets correct expiry for fisher role", async () => {
    if (!authOptions.callbacks?.jwt) throw new Error("JWT callback not defined");
    const token = await authOptions.callbacks.jwt({
      token: {},
      user: fisherUser,
      account: null,
    });
    const expectedExpiry = Math.floor(Date.now() / 1000) + Number(process.env.NEXTAUTH_SESSION_MAX_AGE);
    expect(token.exp).toBe(expectedExpiry);
  });
});

describe("JWT callback: token shape", () => {
  it("adds correct properties to token", async () => {
    if (!authOptions.callbacks?.jwt) throw new Error("JWT callback not defined");
    const token = await authOptions.callbacks.jwt({
      token: {},
      user: fisherUser,
      account: null,
    });
    expect(token).toMatchObject({
      id: "2",
      name: "Sue Flay",
      role: "regular",
      vesselId: 7450,
      sessionId: "s2",
    });
  });
});

describe("Session callback: session object", () => {
  it("maps token to session correctly", async () => {
    if (!authOptions.callbacks?.session) throw new Error("Session not defined");
    const token = { sessionId: "s1", id: "1", name: "Warren Peace", role: "admin" };
    const session = await authOptions.callbacks.session({
      session: {
        user: {},
        expires: "",
      },
      token,
      user: undefined,
    }  as any );

    expect(session).toMatchObject({
      id: "s1",
      user: {
        id: "1",
        name: "Warren Peace",
        role: "admin",
      },
    });
  });

  it("applies defaults for missing fields", async () => {
    const token = {};
    if (!authOptions.callbacks?.session) throw new Error("Session not defined");
    const session = await authOptions.callbacks.session({
      session: {
        user: {},
        expires: "",
      },
      token,
      user: undefined
    } as any );
    expect(session?.user?.name).toBe("No name available");
    expect((session.user as { role: string }).role).toBe("regular");
  });
});
