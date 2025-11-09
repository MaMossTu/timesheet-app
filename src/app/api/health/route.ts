import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: "checking...",
    database: {
      status: "unknown",
      connection: false,
      recordCount: 0,
      error: null as string | null,
      details: null as any,
    },
    server: {
      environment: process.env.NODE_ENV || "unknown",
      vercel: process.env.VERCEL ? true : false,
      region: process.env.VERCEL_REGION || "local",
    },
  };

  try {
    // Try database connection
    try {
      const { prisma } = await import("@/lib/prisma");

      // Test connection with simple count
      const userCount = await prisma.user.count();
      const companyCount = await prisma.company.count();
      const timeEntryCount = await prisma.timeEntry.count();

      healthCheck.database = {
        status: "connected",
        connection: true,
        recordCount: userCount + companyCount + timeEntryCount,
        error: null,
        details: {
          users: userCount,
          companies: companyCount,
          timeEntries: timeEntryCount,
        },
      };
    } catch (dbError) {
      healthCheck.database = {
        status: "failed",
        connection: false,
        recordCount: 0,
        error:
          dbError instanceof Error ? dbError.message : "Unknown database error",
        details: null,
      };
    }

    healthCheck.status = healthCheck.database.connection
      ? "healthy"
      : "degraded";

    return NextResponse.json(healthCheck, {
      status: healthCheck.database.connection ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ...healthCheck,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
