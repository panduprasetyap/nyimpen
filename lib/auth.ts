import { cookies } from "next/headers";
import { jwtVerify, JWTPayload } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_me");

// 1. Definisikan Tipe Data Session agar Autocomplete jalan
export interface SessionPayload extends JWTPayload {
  userId: string;
  name: string;
  email: string;
  photos?: string;     // Opsional, sesuai data dari Laravel
  job_title?: string;  // Opsional
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) return null;

  try {
    const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
    // Casting payload ke tipe SessionPayload yang kita buat
    return payload as SessionPayload;
  } catch (error) {
    console.error("JWT Verification failed:", error);
    return null;
  }
}

export async function getCurrentUser() {

  const session = await getSession();

  if (!session) return null;
  return {
    id: session.userId,
    name: session.name,
    email: session.email,
    photos: session.photos || null,
    job_title: session.job_title || null,
  };
}