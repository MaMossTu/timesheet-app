import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - ดึงข้อมูล companies ของ user
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID จำเป็น" }, { status: 400 });
    }

    const companies = await prisma.company.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error("GET companies error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}

// POST - สร้าง company ใหม่
export async function POST(request: NextRequest) {
  try {
    const { name, code, description, approvedBy, dateSign, userId } =
      await request.json();

    if (!name || !userId) {
      return NextResponse.json(
        { error: "ชื่อบริษัทและ User ID จำเป็น" },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        code,
        description,
        approvedBy,
        dateSign,
        userId,
      },
    });

    return NextResponse.json({
      company,
      message: "เพิ่มบริษัทสำเร็จ",
    });
  } catch (error) {
    console.error("POST company error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}

// PUT - อัปเดต company
export async function PUT(request: NextRequest) {
  try {
    const { id, userId, ...updateData } = await request.json();

    if (!id || !userId) {
      return NextResponse.json(
        { error: "ID และ User ID จำเป็น" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าเป็นเจ้าของ company นี้
    const existingCompany = await prisma.company.findUnique({
      where: { id },
    });

    if (!existingCompany || existingCompany.userId !== userId) {
      return NextResponse.json(
        { error: "ไม่พบบริษัทหรือไม่มีสิทธิ์แก้ไข" },
        { status: 404 }
      );
    }

    const company = await prisma.company.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      company,
      message: "อัปเดตบริษัทสำเร็จ",
    });
  } catch (error) {
    console.error("PUT company error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}

// DELETE - ลบ company
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const userId = url.searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json(
        { error: "ID และ User ID จำเป็น" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าเป็นเจ้าของ company นี้
    const existingCompany = await prisma.company.findUnique({
      where: { id },
    });

    if (!existingCompany || existingCompany.userId !== userId) {
      return NextResponse.json(
        { error: "ไม่พบบริษัทหรือไม่มีสิทธิ์ลบ" },
        { status: 404 }
      );
    }

    // ลบ time entries ที่เกี่ยวข้องก่อน
    await prisma.timeEntry.deleteMany({
      where: { companyId: id, userId },
    });

    // ลบ company
    await prisma.company.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "ลบบริษัทสำเร็จ",
    });
  } catch (error) {
    console.error("DELETE company error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
