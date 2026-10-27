import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export type Token = Record<string, unknown> & {
  role?: string;
  vesselId?: string;
};

type AuthResult =
  | { ok: true; token: Token }
  | { ok: false; response: Response };

type RouteResultAdmin =
  | { ok: true; token: Token }
  | { ok: false; response: Response };

type RouteResultFisher =
  | { ok: true; token: Token }
  | { ok: false; response: Response };

async function authenticate(req: NextRequest, tag: string): Promise<AuthResult> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    console.error(`[${tag} - authenticate] No token found in request`);
    return {
      ok: false,
      response: Response.json({ error: `[${tag} - authenticate] Unauthorised` }, { status: 401 }),
    };
  }

  return { ok: true, token: token as Token };
}

function checkRole(token: Token, role: "admin" | "fisher" | "analyst", tag: string): Response | null {
  if (token.role !== role) {
    console.error(`[${tag} - checkRole] Forbidden role:`, token.role);
    return Response.json({ error: `[${tag} - checkRole] Forbidden` }, { status: 403 });
  }
  return null;
}

export function parseFileIds(req: NextRequest, tag: string): string[] | Response {
  const fileIds = new URL(req.url).searchParams.get("ids")?.split(",").filter(Boolean);
  if (!fileIds || fileIds.length === 0) {
    console.error(`[${tag} - parseFileIds] Missing file ids in request`);
    return Response.json({ error: `[${tag} - parseFileIds] Missing file ids` }, { status: 400 });
  }
  return fileIds;
}

export async function requireAdmin( req: NextRequest, tag: string): Promise<RouteResultAdmin> {
  const authResult = await authenticate(req, tag);
  if (!authResult.ok) return { ok: false, response: authResult.response };

  const roleError = checkRole(authResult.token, "admin", tag);
  if (roleError) return { ok: false, response: roleError };

  return { ok: true, token: authResult.token  };
}

export async function requireFisher( req: NextRequest, tag: string ): Promise<RouteResultFisher> {
  const authResult = await authenticate(req, tag);
  if (!authResult.ok) return { ok: false, response: authResult.response };

  const roleError = checkRole(authResult.token, "fisher", tag);
  if (roleError) return { ok: false, response: roleError };

  return { ok: true, token: authResult.token  };
}

export async function requireAnalyst( req: NextRequest, tag: string ): Promise<RouteResultFisher> {
  const authResult = await authenticate(req, tag);
  if (!authResult.ok) return { ok: false, response: authResult.response };

  const roleError = checkRole(authResult.token, "analyst", tag);
  if (roleError) return { ok: false, response: roleError };

  return { ok: true, token: authResult.token  };
}

export function extractVesselId(token: Token, tag: string): string | Response {
  if (!token.vesselId) {
    console.error(`[${tag} - extractVesselId] No vessel ID found in token:`, token);
    return Response.json({ error: `[${tag} - extractVesselId] Missing vessel ID` }, { status: 403 });
  }
  return token.vesselId;
}
