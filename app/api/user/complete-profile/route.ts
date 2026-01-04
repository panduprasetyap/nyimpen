import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { API_ENDPOINTS } from "@/lib/api-config";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_me");

export async function POST(req: Request) {
  try {
    const sessionToken = (await cookies()).get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let currentPayload: any;
    let userId: string;
    let email: string;
    let name: string;
    try {
        const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
        userId = payload.userId as string;
        email = payload.email as string;
        name = payload.name as string;
    } catch (e) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { job_title, estimated_monthly_income } = body;

    // Get all cookies from the current request to forward to Laravel
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies
        .map(c => `${c.name}=${c.value}`)
        .join('; ');
    
    const res = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Cookie": cookieHeader,
      },
      body: JSON.stringify({ 
        id: Number(userId),
        name: name,
        email: email,
        job_title, 
        estimated_monthly_income: Number(estimated_monthly_income)
      }),
    });

    const contentType = res.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
        data = await res.json();
    } else {
        const text = await res.text();
        console.error("REST Server non-JSON response:", text);
        return NextResponse.json(
            { message: "REST server returned an invalid response", detail: text }, 
            { status: 500 }
        );
    }

    if (!res.ok) {
      console.error("REST Server Error Response:", data);
      return NextResponse.json(
        { message: data.message || "Failed to update profile", detail: data.errors }, 
        { status: res.status }
      );
    }

    
    const newSessionPayload = {
        ...currentPayload, // Copy userId, email, photos, dll
        job_title: job_title, // Update job title
    };

    // 2. Sign Token Baru
    const newToken = await new SignJWT(newSessionPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h") // Reset waktu expired jadi 24 jam lagi
      .sign(JWT_SECRET);

    const response = NextResponse.json({ 
            message: "Profile updated successfully", 
            user: {
                ...newSessionPayload, // Kirim balik data terbaru ke client
                id: currentPayload.userId // Pastikan ID konsisten
            } 
        });

    response.cookies.set("session_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Profile Update Internal Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
