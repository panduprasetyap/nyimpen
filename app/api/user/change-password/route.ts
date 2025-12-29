import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_me");

async function getUserId() {
  const sessionToken = (await cookies()).get("session_token")?.value;
  if (!sessionToken) return null;
  try {
    const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
    return payload.userId as string;
  } catch {
    return null;
  }
}

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
        return NextResponse.json({ message: "Current and new password are required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
        return NextResponse.json({ message: "Incorrect current password" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: BigInt(userId) },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
