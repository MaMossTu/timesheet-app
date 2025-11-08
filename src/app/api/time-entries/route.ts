import { NextRequest, NextResponse } from "next/server";

// GET - ดึงข้อมูล time entries (Mock implementation)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID จำเป็น" }, { status: 400 });
    }

    // Return empty array since we're using localStorage on client-side
    const timeEntries: any[] = [];

    return NextResponse.json({ timeEntries });
  } catch (error) {
    console.error("GET time entries error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}

// POST - สร้าง time entry ใหม่ (Mock implementation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // For demo purposes, just return success
    return NextResponse.json({
      timeEntry: {
        id: Date.now().toString(),
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
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

// PUT - อัปเดต time entry (Mock implementation)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // For demo purposes, just return success
    return NextResponse.json({
      timeEntry: {
        ...body,
        updatedAt: new Date().toISOString(),
      },
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

// DELETE - ลบ time entry (Mock implementation)
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID จำเป็น" }, { status: 400 });
    }

    // For demo purposes, just return success
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
