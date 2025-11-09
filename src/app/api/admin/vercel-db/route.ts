import { NextRequest, NextResponse } from "next/server";

// In-memory database for demo on Vercel
const demoUsers = [
  {
    id: "1",
    email: "demo@example.com",
    username: "demo",
    name: "Demo User",
    prefix: "Mr.",
    selectedCompanyId: "company1_user1",
    companies: [
      {
        id: "company1_user1",
        name: "ABC Corporation",
        code: "ABC",
        description: "Technology Solutions Company",
        approvedBy: "John Smith (Manager)",
        userId: "1",
      },
      {
        id: "company2_user1",
        name: "XYZ Enterprise",
        code: "XYZ",
        description: "Consulting Services",
        approvedBy: "Sarah Johnson (Director)",
        userId: "1",
      },
    ],
    timeEntries: [],
  },
  {
    id: "2",
    email: "admin@example.com",
    username: "admin",
    name: "kittapath sangvikukit",
    prefix: "Mr.",
    selectedCompanyId: "company1_user2",
    companies: [
      {
        id: "company1_user2",
        name: "Rabbit Corporation",
        code: "RBT",
        description: "Digital Innovation Company",
        approvedBy: "Boss Manager",
        userId: "2",
      },
    ],
    timeEntries: [
      {
        id: "entry1",
        title: "Team Meeting",
        description: "Weekly team sync",
        startTime: "2025-11-04T02:00:00.000Z",
        endTime: "2025-11-04T11:00:00.000Z",
        date: "2025-11-04",
        userId: "2",
        companyId: "company1_user2",
      },
      {
        id: "entry2",
        title: "Project Development",
        description: "Working on main project",
        startTime: "2025-11-05T02:00:00.000Z",
        endTime: "2025-11-05T11:00:00.000Z",
        date: "2025-11-05",
        userId: "2",
        companyId: "company1_user2",
      },
    ],
  },
];

export async function GET(req: NextRequest) {
  try {
    // Simple authentication
    const { searchParams } = new URL(req.url);
    const adminKey = searchParams.get("key") || req.headers.get("x-admin-key");

    if (adminKey !== "admin123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Simulate database queries with in-memory data
    const users = demoUsers.map((user) => ({
      ...user,
      companies: user.companies || [],
      timeEntries: user.timeEntries || [],
    }));

    const companies = demoUsers.flatMap((user) =>
      (user.companies || []).map((company) => ({
        ...company,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        timeEntries:
          user.timeEntries?.filter((entry) => entry.companyId === company.id) ||
          [],
      }))
    );

    const timeEntries = demoUsers.flatMap((user) =>
      (user.timeEntries || []).map((entry) => ({
        ...entry,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        company: user.companies?.find((c) => c.id === entry.companyId) || {
          id: entry.companyId,
          name: "Unknown Company",
          code: "UNK",
        },
      }))
    );

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
      note: "Using in-memory demo data for Vercel deployment",
    });
  } catch (error) {
    console.error("Database view error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch database data",
        details: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : null
            : null,
      },
      { status: 500 }
    );
  }
}
