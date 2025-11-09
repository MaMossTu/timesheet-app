import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - ดึงข้อมูล profile ของ user
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID จำเป็น" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        companies: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET profile error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}

// PUT - อัปเดต profile ของ user
export async function PUT(request: NextRequest) {
  try {
    const { id, password, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "User ID จำเป็น" }, { status: 400 });
    }

    // กรอง password ออกเพราะไม่มีใน database schema
    // ใน production ควรมี password handling ที่เหมาะสม

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        companies: true,
      },
    });

    return NextResponse.json({
      user,
      message: "อัปเดตข้อมูลสำเร็จ",
    });
  } catch (error) {
    console.error("PUT profile error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
