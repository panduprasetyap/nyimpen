import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { API_ENDPOINTS } from "@/lib/api-config";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_me");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const res = await fetch(API_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ message: data.message || "Invalid credentials" }, { status: res.status });
    }

    const { user } = data;

    // Capture Laravel Cookies
    const laravelCookies = res.headers.getSetCookie();
    console.log("Laravel Cookies Received:", laravelCookies);

    // Generate JWT for local session management
    const token = await new SignJWT({ 
        userId: user.id.toString(), 
        email: user.email,
        name: user.name, // Include name here
        photos: user.photos, 
        job_title: user.job_title
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    const response = NextResponse.json({ 
      message: "Login successful", 
      user: { 
        id: user.id.toString(), 
        name: user.name, 
        email: user.email,
        job_title: user.job_title,
        estimated_monthly_income: user.estimated_monthly_income,
        photos: user.photos
      } 
    });

    // Set Local Session Cookie
    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Forward Laravel Cookies to Browser
    if (laravelCookies.length > 0) {
        laravelCookies.forEach(cookieString => {
            // Use a more robust split for name and value
            const parts = cookieString.split(';');
            const nameValue = parts[0];
            const firstEqualIndex = nameValue.indexOf('=');
            if (firstEqualIndex !== -1) {
                const name = nameValue.substring(0, firstEqualIndex).trim();
                const value = nameValue.substring(firstEqualIndex + 1).trim();
                console.log(`Setting Browser Cookie: ${name}=${value}`);
                response.cookies.set(name, value, {
                    path: '/',
                    httpOnly: true,
                    secure: false, // Force false for local dev compatibility
                    sameSite: 'lax'
                });
            }
        });
    }

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
