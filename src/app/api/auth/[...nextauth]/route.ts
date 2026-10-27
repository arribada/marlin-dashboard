import NextAuth from "next-auth";
import { authOptions } from "@/_lib/authOptions";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

export async function HEAD() {
  return new Response(null, { status: 200 });
}
