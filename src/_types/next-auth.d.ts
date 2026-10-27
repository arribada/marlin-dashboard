import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    id: string;
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role?: string;
    sessionId: string;
    vesselId?: number;
  }

  interface JWT {
    role?: string;
    sessionId: string;
    vesselId?: number;
  }
}
