import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

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

export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const user = await db.user.findUnique({
      where: { id: BigInt(userId) },
      select: {
        name: true,
        email: true,
        job_title: true,
        estimated_monthly_income: true,
        photos: true,
      },
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({
        ...user,
        estimated_monthly_income: user.estimated_monthly_income?.toNumber() || 0
    });
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, email, job_title, estimated_monthly_income, photos } = body; // photos url if updated

    // Validate email if changed? For now, we allow updating it freely but ideally check uniqueness.
    // Assuming unique constraint on email might throw error if duplicate.

    const updatedUser = await db.user.update({
      where: { id: BigInt(userId) },
      data: {
        name,
        email,
        job_title,
        estimated_monthly_income: estimated_monthly_income ? parseFloat(estimated_monthly_income) : 0,
        photos: photos || undefined, // Only update if provided
      },
      select: {
          id: true,
          name: true,
          email: true,
          job_title: true,
          estimated_monthly_income: true,
          photos: true
      }
    });

    return NextResponse.json({
        message: "Profile updated successfully",
        user: {
            ...updatedUser,
            id: updatedUser.id.toString(),
            estimated_monthly_income: updatedUser.estimated_monthly_income?.toNumber() || 0
        }
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ message: "Could not update profile" }, { status: 500 });
  }
}
