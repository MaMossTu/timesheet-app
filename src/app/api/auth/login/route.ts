import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username และ password จำเป็น" },
        { status: 400 }
      );
    }

    // For demo purposes, we'll use simple hardcoded credentials
    // In production, use proper password hashing (bcrypt, argon2, etc.)
    let user = null;

    if (username === "demo" && password === "demo123") {
      user = await prisma.user.findUnique({
        where: { username: "demo" },
        include: {
          companies: true,
        },
      });
    } else if (username === "admin" && password === "admin") {
      user = await prisma.user.findUnique({
        where: { username: "admin" },
        include: {
          companies: true,
        },
      });
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
