import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const protectedRoutes: string[] = [];

export default async function middlware(request: NextRequest) {
  const session = await auth();

  const pathname = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !session)
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));

  return NextResponse.next();
}
