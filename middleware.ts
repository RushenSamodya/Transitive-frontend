import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname) || pathname === "/") {
    return NextResponse.next();
  }

  const token = req.cookies.get("transit_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role is stored in its own cookie set at login time.
  // The JWT only contains { id } — role is not embedded in the token.
  const role = req.cookies.get("transit_role")?.value ?? null;

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/depot/dashboard", req.url));
  }

  if (pathname.startsWith("/depot") && role !== "depot_manager") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
