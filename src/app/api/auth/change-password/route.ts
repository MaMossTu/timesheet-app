import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  try {
    const { currentPassword, newPassword, userId } = await req.json();

    if (!currentPassword || !newPassword || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // For now, we'll skip current password verification since we don't have password in schema
    // In a real implementation, you would verify the current password here
    // const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    // if (!isCurrentPasswordValid) {
    //   return NextResponse.json(
    //     { error: "Current password is incorrect" },
    //     { status: 401 }
    //   );
    // }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Note: Since we don't have password field in User schema,
    // this will fail until we add it to the schema
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { password: hashedNewPassword }
    // });

    // For now, just return success (this is a placeholder)
    console.log("Password change requested for user:", userId);
    console.log("New hashed password would be:", hashedNewPassword);

    return NextResponse.json({
      success: true,
      message: "Password change functionality needs database schema update",
    });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
