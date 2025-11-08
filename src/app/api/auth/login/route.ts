import { NextRequest, NextResponse } from "next/server";

// Mock users data (replace with real database in production)
const mockUsers = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123", // In production, this should be hashed
    name: "Admin User",
    username: "admin",
  },
  {
    id: "2",
    email: "user@example.com",
    password: "user123",
    name: "Regular User",
    username: "user",
  },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email และ password จำเป็น" },
        { status: 400 }
      );
    }

    // หาผู้ใช้ใน mock data
    const user = mockUsers.find((u) => u.email === email);

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Email หรือ password ไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // ส่งผลลัพธ์กลับ (ไม่รวม password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
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
