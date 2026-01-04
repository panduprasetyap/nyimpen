import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_ENDPOINTS } from "@/lib/api-config";
import { getSession } from "@/lib/auth";

// Helper untuk mengambil token dari cookies
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

// GET: Ambil Profile dari Laravel
export async function GET(req: Request) {
  const headers = await getAuthHeader();
  if (!headers)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const userId = session.userId as string;

    // Forward request ke Laravel: Route::get('profile')

    const targetUrl = `${API_ENDPOINTS.PROFILE}?id=${userId}`;
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: headers,
      cache: "no-store", // Data profil selalu dinamis, jangan di-cache
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // Berhasil, kembalikan data dari Laravel ke Frontend
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch Profile Proxy Error:", error);
    return NextResponse.json(
      { message: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}

// PUT: Update Profile ke Laravel
export async function PUT(req: Request) {
  const headers = await getAuthHeader();
  if (!headers)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const userId = session.userId as string;
    const body = await req.json();

    // Tambahkan ID ke body
    const payload = { ...body, id: userId };

    console.log("Request Body:", body);

    // Forward request ke Laravel: Route::put('profile')
    const res = await fetch(API_ENDPOINTS.PROFILE, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      // Jika validasi Laravel gagal (422), forward error-nya ke frontend
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update Profile Proxy Error:", error);
    return NextResponse.json(
      { message: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}
