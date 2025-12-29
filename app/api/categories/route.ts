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
    const categories = await db.categories.findMany({
      where: { user_id: BigInt(userId) },
      orderBy: { name: 'asc' }
    });

    const serializedCategories = categories.map((c: { id: bigint; user_id: bigint; name: string; type: string; created_at: Date | null; updated_at: Date | null }) => ({
      ...c,
      id: c.id.toString(),
      user_id: c.user_id.toString(),
    }));

    return NextResponse.json({ categories: serializedCategories });
  } catch (error) {
    console.error("Fetch Categories Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, type } = body;

    if (!name || !type) {
      return NextResponse.json({ message: "Name and type are required" }, { status: 400 });
    }

    const newCategory = await db.categories.create({
      data: {
        user_id: BigInt(userId),
        name,
        type,
      },
    });

    return NextResponse.json({ 
      message: "Category created", 
      category: {
        ...newCategory,
        id: newCategory.id.toString(),
        user_id: newCategory.user_id.toString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Create Category Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ message: "Category ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const { name, type } = body;

    const existingCategory = await db.categories.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingCategory || existingCategory.user_id.toString() !== userId) {
      return NextResponse.json({ message: "Category not found or access denied" }, { status: 404 });
    }

    const updatedCategory = await db.categories.update({
      where: { id: BigInt(id) },
      data: { name, type },
    });

    return NextResponse.json({ 
      message: "Category updated", 
      category: {
        ...updatedCategory,
        id: updatedCategory.id.toString(),
        user_id: updatedCategory.user_id.toString()
      }
    });
  } catch (error) {
     console.error("Update Category Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ message: "Category ID is required" }, { status: 400 });
    }
    
    const existingCategory = await db.categories.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingCategory || existingCategory.user_id.toString() !== userId) {
      return NextResponse.json({ message: "Category not found or access denied" }, { status: 404 });
    }

    try {
        await db.categories.delete({
            where: { id: BigInt(id) },
        });
    } catch (e: any) {
        if (e.code === 'P2003') { // Foreign key constraint failed
            return NextResponse.json({ message: "Cannot delete category because it has related transactions." }, { status: 400 });
        }
        throw e;
    }

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
