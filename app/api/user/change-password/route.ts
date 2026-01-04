import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { API_ENDPOINTS } from "@/lib/api-config";
import { getSession } from "@/lib/auth";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_key_change_me"
);

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

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
  try {
    const session = await getSession();
    const headers = await getAuthHeader();

    if (!session || !headers) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Tambahkan ID user ke payload jika Laravel Anda membutuhkannya secara manual
    const payload = {
      ...body,
      id: session.userId,
    };

    const res = await fetch(`${API_ENDPOINTS.CHANGE_PASSWORD}`, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    console.log(data);

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
