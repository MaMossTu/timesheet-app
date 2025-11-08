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

    // สำหรับ demo version นี้ จะ return success เสมอ
    // ใน production ควรใช้ database จริง

    // สร้าง mock user object
    const user = {
      id: Date.now().toString(),
      email,
      name: name || "ผู้ใช้ใหม่",
      username: email.split("@")[0],
    };

    return NextResponse.json({
      user: user,
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
