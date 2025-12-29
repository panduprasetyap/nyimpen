import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_me");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT
    const token = await new SignJWT({ userId: user.id.toString(), email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    // Set Cookie
    (await cookies()).set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({ 
      message: "Login successful", 
      user: { 
        id: user.id.toString(), 
        name: user.name, 
        email: user.email,
        job_title: user.job_title,
        estimated_monthly_income: user.estimated_monthly_income
      } 
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
