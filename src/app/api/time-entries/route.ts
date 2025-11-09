import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - ดึงข้อมูล time entries
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID จำเป็น" }, { status: 400 });
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        company: true,
        user: true,
      },
    });

    return NextResponse.json({ timeEntries });
  } catch (error) {
    console.error("GET time entries error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}

// POST - สร้าง time entry ใหม่
export async function POST(request: NextRequest) {
  try {
    const { title, description, startTime, endTime, date, userId, companyId } =
      await request.json();

    if (!title || !startTime || !userId || !companyId) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        title,
        description,
        startTime,
        endTime,
        date,
        userId,
        companyId,
      },
      include: {
        company: true,
        user: true,
      },
    });

    return NextResponse.json({
      timeEntry,
      message: "บันทึกเวลาทำงานสำเร็จ",
    });
  } catch (error) {
    console.error("POST time entry error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}

// PUT - อัปเดต time entry
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID จำเป็น" }, { status: 400 });
    }

    const timeEntry = await prisma.timeEntry.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
        user: true,
      },
    });

    return NextResponse.json({
      timeEntry,
      message: "อัปเดตเวลาทำงานสำเร็จ",
    });
  } catch (error) {
    console.error("PUT time entry error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}

// DELETE - ลบ time entry
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID จำเป็น" }, { status: 400 });
    }

    await prisma.timeEntry.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "ลบเวลาทำงานสำเร็จ",
    });
  } catch (error) {
    console.error("DELETE time entry error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
