import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import validateEnvVar from "@/_utils/validateEnvVar";
import { ROLES } from "@/_types/roles";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_TEST_LOGIN !== "true") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const secret = validateEnvVar("NEXTAUTH_SECRET", "string") as string;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { role } = body;
  if (!role || typeof role !== "string") {
    return NextResponse.json({ error: "Missing or invalid 'role' field" }, { status: 400 });
  }

  if (!ROLES.includes(role)) {
    return NextResponse.json({ error: "Unauthorised role" }, { status: 403 });
  }

  const token = await encode({
    token: {
      id: `test-${role}`,
      name: `Test ${role}`,
      role,
    },
    secret,
    maxAge: 900,
  });

  return NextResponse.json({ token });
}
