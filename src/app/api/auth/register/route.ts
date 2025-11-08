import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email และ password จำเป็น" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า email ซ้ำหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email นี้มีการใช้งานแล้ว" },
        { status: 400 }
      );
    }

    // สร้างผู้ใช้ใหม่ (ใช้ plaintext password ชั่วคราว)
    const user = await prisma.user.create({
      data: {
        email,
        password, // ในการใช้งานจริงควร hash ด้วย bcrypt
        name: name || "ผู้ใช้ใหม่",
      },
    });

    // ส่งผลลัพธ์กลับ (ไม่รวม password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: "สมัครสมาชิกสำเร็จ",
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
