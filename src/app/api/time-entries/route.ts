import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      include: {
        project: true,
        category: true,
      },
      orderBy: { startTime: "desc" },
    });

    return NextResponse.json(timeEntries);
  } catch (error) {
    console.error("Get time entries error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}

// POST - สร้าง time entry ใหม่
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      title,
      description,
      startTime,
      endTime,
      projectId,
      categoryId,
    } = await request.json();

    if (!userId || !title || !startTime) {
      return NextResponse.json(
        { error: "User ID, title และ startTime จำเป็น" },
        { status: 400 }
      );
    }

    // หา project หรือสร้างใหม่
    let project = null;
    if (!projectId) {
      project = await prisma.project.findFirst({
        where: { userId, name: "ทั่วไป" },
      });

      if (!project) {
        project = await prisma.project.create({
          data: {
            name: "ทั่วไป",
            description: "โปรเจคทั่วไป",
            userId,
          },
        });
      }
    }

    // คำนวณ duration ถ้ามี endTime
    let duration = null;
    if (endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60)); // minutes
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        userId,
        title,
        description: description || "",
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration,
        projectId: projectId || project?.id,
        categoryId: categoryId || null,
        isCompleted: !!endTime,
      },
      include: {
        project: true,
        category: true,
      },
    });

    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error("Create time entry error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}

// PUT - อัปเดต time entry
export async function PUT(request: NextRequest) {
  try {
    const {
      id,
      title,
      description,
      startTime,
      endTime,
      projectId,
      categoryId,
    } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID จำเป็น" }, { status: 400 });
    }

    // คำนวณ duration ถ้ามี endTime
    let duration = null;
    if (endTime && startTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60)); // minutes
    }

    const timeEntry = await prisma.timeEntry.update({
      where: { id },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : null,
        duration,
        projectId,
        categoryId,
        isCompleted: !!endTime,
      },
      include: {
        project: true,
        category: true,
      },
    });

    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error("Update time entry error:", error);
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

    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ" });
  } catch (error) {
    console.error("Delete time entry error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
