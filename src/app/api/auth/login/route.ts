import { NextRequest, NextResponse } from "next/server";

// Demo users for fallback (when database is not available)
const demoUsers = {
  demo: {
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
    ],
  },
  admin: {
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
  },
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username และ password จำเป็น" },
        { status: 400 }
      );
    }

    let user = null;

    // Check credentials
    if (
      (username === "demo" && password === "demo123") ||
      (username === "admin" && password === "admin")
    ) {
      // Try database first
      try {
        const { prisma } = await import("@/lib/prisma");
        user = await prisma.user.findUnique({
          where: { username },
          include: {
            companies: true,
          },
        });
      } catch (dbError) {
        console.log("Database unavailable, using demo data:", dbError);
      }

      // Fallback to demo data if database fails
      if (!user && demoUsers[username as keyof typeof demoUsers]) {
        user = demoUsers[username as keyof typeof demoUsers];
        console.log("Using demo user data for:", username);
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Username หรือ password ไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: user,
      message: "Login สำเร็จ",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
