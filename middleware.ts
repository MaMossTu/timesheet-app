// middleware.ts - Add this file to protect against abuse
import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip || "anonymous";
  const limit = 50; // requests per 10 minutes
  const windowMs = 10 * 60 * 1000; // 10 minutes

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, {
      count: 0,
      lastReset: Date.now(),
    });
  }

  const ipData = rateLimitMap.get(ip);

  if (Date.now() - ipData.lastReset > windowMs) {
    ipData.count = 0;
    ipData.lastReset = Date.now();
  }

  if (ipData.count >= limit) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "600",
      },
    });
  }

  ipData.count += 1;

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
