import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email และ password จำเป็น" },
        { status: 400 }
      );
    }

    try {
      // Try database first
      const { prisma } = await import("@/lib/prisma");

      // ตรวจสอบว่า email นี้มีอยู่แล้วหรือไม่
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email นี้มีอยู่ในระบบแล้ว" },
          { status: 409 }
        );
      }

      // สร้าง user ใหม่
      const user = await prisma.user.create({
        data: {
          email,
          name: name || "ผู้ใช้ใหม่",
          username: email.split("@")[0],
        },
        include: {
          companies: true,
        },
      });

      return NextResponse.json({
        user: user,
        message: "สมัครสมาชิกสำเร็จ",
      });
    } catch (dbError) {
      console.log("Database unavailable, using demo mode for registration");

      // Demo mode - return success but with limited functionality
      const demoUser = {
        id: `demo_${Date.now()}`,
        email,
        name: name || "ผู้ใช้ใหม่",
        username: email.split("@")[0],
        companies: [],
      };

      return NextResponse.json({
        user: demoUser,
        message: "สมัครสมาชิกสำเร็จ (โหมดทดลอง)",
        isDemo: true,
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
