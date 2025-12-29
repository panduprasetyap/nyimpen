import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
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

export async function POST(req: Request) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "No files received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename =  Date.now() + "_" + file.name.replaceAll(" ", "_");
    
    // Save to public/uploads
    // Note: In production (Vercel), persistent file storage needs S3 or similar. 
    // This works for local dev or persistent disks.
    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    try {
        await writeFile(path.join(uploadDir, filename), buffer);
        return NextResponse.json({ 
            message: "Success", 
            url: `/uploads/${filename}` 
        }, { status: 201 });
    } catch (error) {
        console.error("Upload failed:", error);
        return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
    }
}
