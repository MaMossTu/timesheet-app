import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Simple authentication - check for admin key in query params or headers
    const { searchParams } = new URL(req.url);
    const adminKey = searchParams.get("key") || req.headers.get("x-admin-key");

    if (adminKey !== "admin123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // ดูข้อมูลทั้งหมด
    const users = await prisma.user.findMany({
      include: {
        companies: true,
        timeEntries: true,
      },
    });

    const companies = await prisma.company.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        timeEntries: true,
      },
    });

    const timeEntries = await prisma.timeEntry.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        users,
        companies,
        timeEntries,
        summary: {
          totalUsers: users.length,
          totalCompanies: companies.length,
          totalTimeEntries: timeEntries.length,
        },
      },
    });
  } catch (error) {
    console.error("Database view error:", error);
    return NextResponse.json(
      { error: "Failed to fetch database data" },
      { status: 500 }
    );
  }
}
