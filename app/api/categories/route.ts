import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_ENDPOINTS } from "@/lib/api-config";
import { getSession } from "@/lib/auth";

async function getForwardHeaders() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies
    .map(c => `${c.name}=${c.value}`)
    .join('; ');

  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Cookie": cookieHeader,
  };
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const userId = session.userId as string;

    const headers = await getForwardHeaders();
    const url = `${API_ENDPOINTS.CATEGORIES}?user_id=${userId}`;
    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    const data = await res.json();
    console.log(">>> [DEBUG] Raw Categories Data from REST:", data);
    
    // Normalize data for frontend
    let normalizedCategories = [];
    if (data && Array.isArray(data.categories)) {
        normalizedCategories = data.categories;
    } else if (data && Array.isArray(data.data)) {
        normalizedCategories = data.data;
    } else if (Array.isArray(data)) {
        normalizedCategories = data;
    }

    console.log(">>> [DEBUG] Normalized Categories for Frontend:", normalizedCategories);

    return NextResponse.json({ categories: normalizedCategories }, { status: res.status });
  } catch (error) {
    console.error("Fetch Categories Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const userId = session.userId as string;

    const body = await req.json();
    const headers = await getForwardHeaders();
    const res = await fetch(API_ENDPOINTS.CATEGORIES, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...body,
        user_id: userId
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Create Category Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Category ID is required" }, { status: 400 });

    const body = await req.json();
    const headers = await getForwardHeaders();
    const res = await fetch(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Update Category Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Category ID is required" }, { status: 400 });

    const headers = await getForwardHeaders();
    const res = await fetch(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
      method: "DELETE",
      headers,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Delete Category Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
