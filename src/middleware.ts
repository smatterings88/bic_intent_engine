import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Expose pathname to server layouts for per-route chrome (e.g. Zenith footer opt-out). */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
