import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === "admin";
    const path = req.nextUrl.pathname;

    if (path.startsWith("/vessels") && !isAdmin) {
      return NextResponse.redirect(new URL("/unauthorised", req.url));
    }

    if (path.startsWith("/api/admin") && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!login|unauthorised|_next/static|_next/image|favicon.ico|marlin_logo.webp|api/test-login).*)",
  ],
};
