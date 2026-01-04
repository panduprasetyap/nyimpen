import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api-config";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    const res = await fetch(API_ENDPOINTS.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Registration failed", detail: data.errors },
        { status: res.status }
      );
    }

    const { user } = data;

    return NextResponse.json({ 
      message: "Registration successful", 
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ 
      message: "Internal server error", 
      detail: error.message 
    }, { status: 500 });
  }
}