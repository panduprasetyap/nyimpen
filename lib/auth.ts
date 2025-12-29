import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_me");

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  if (!sessionToken) return null;

  try {
    const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: BigInt(session.userId as string) },
      select: {
        name: true,
        email: true,
        photos: true,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
}
