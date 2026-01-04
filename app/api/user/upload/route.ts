import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_ENDPOINTS } from "@/lib/api-config"; // Import config Anda
import { getSession } from "@/lib/auth";

// Helper untuk Auth Header (Tanpa Content-Type JSON)
async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    // PENTING: Jangan set "Content-Type" di sini untuk Upload File.
    // Fetch akan otomatis set "multipart/form-data; boundary=..." saat mendeteksi body FormData.
  };
}

export async function POST(req: Request) {
  try {
    // 1. Cek Token Auth
    const session = await getSession(); // Ambil ses
    const headers = await getAuthHeader();
    if (!session || !headers) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    formData.append("id", session.userId as string);

    const file = formData.get("file");
    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    const res = await fetch(API_ENDPOINTS.UPLOAD_PROFILE_PICTURE, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Laravel Upload Error:", data);
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Upload Proxy Error:", error);
    return NextResponse.json(
      { message: "Failed to connect to upload server" },
      { status: 500 }
    );
  }
}
