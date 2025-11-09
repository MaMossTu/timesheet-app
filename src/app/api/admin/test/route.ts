import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Simple authentication
    const { searchParams } = new URL(req.url);
    const adminKey = searchParams.get("key") || req.headers.get("x-admin-key");

    if (adminKey !== "admin123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Test database connection first
    const userCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userCount,
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
