import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  constantTimeEqual,
  getExpectedSessionToken,
} from "@/lib/admin-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const expected = await getExpectedSessionToken();

  if (!token || !constantTimeEqual(token, expected)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
