import { NextResponse } from "next/server";

export async function GET() {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      database: {
        status: "skipped",
        connection: null,
        recordCount: "N/A",
        error: null,
        details: "Database check disabled for serverless compatibility",
      },
      server: {
        environment: process.env.NODE_ENV || "unknown",
        vercel: !!process.env.VERCEL,
        region: process.env.VERCEL_REGION || "unknown",
      },
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        server: {
          environment: process.env.NODE_ENV || "unknown",
          vercel: !!process.env.VERCEL,
          region: process.env.VERCEL_REGION || "unknown",
        },
      },
      { status: 500 }
    );
  }
}
