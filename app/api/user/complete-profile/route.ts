import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_me");

export async function POST(req: Request) {
  try {
    const sessionToken = (await cookies()).get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let userId: string;
    try {
        const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
        userId = payload.userId as string;
    } catch (e) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { job_title, estimated_monthly_income } = body;

    // Optional: Validate input? 
    // The user didn't ask for validation, just to save.

    await db.user.update({
      where: { id: BigInt(userId) },
      data: {
        job_title,
        estimated_monthly_income: estimated_monthly_income ? parseFloat(estimated_monthly_income) : 0,
      },
    });

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
