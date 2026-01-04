"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/api-config";
import { cookies } from "next/headers";

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

export async function createWallet(formData: FormData) {
  try {
    const session = await getSession();
    const headers = await getAuthHeader();

    if (!session || !headers) {
      return { success: false, message: "Anda harus login terlebih dahulu." };
    }

    const payload = {
      user_id: session.userId, // Fallback untuk Laravel controller Anda
      name: formData.get("name"),
      type: formData.get("type"),
      balance: formData.get("balance") || 0,
    };

    const res = await fetch(API_ENDPOINTS.WALLET, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Gagal menyimpan wallet.",
      };
    }

    revalidatePath("/dashboard/wallets");
    return { success: true, message: "Wallet berhasil dibuat!" };
  } catch (error) {
    console.error("Error creating wallet:", error);
    return { success: false, message: "Gagal terhubung ke server backend." };
  }
}

export async function updateWallet(formData: FormData) {
  try {
    const session = await getSession();
    const headers = await getAuthHeader();

    if (!session || !headers) {
      return { success: false, message: "Anda harus login terlebih dahulu." };
    }

    const id = formData.get("id");
    const payload = {
      user_id: session.userId,
      name: formData.get("name"),
      type: formData.get("type"),
    };

    // Laravel PUT menggunakan ID di URL: /api/wallets/{id}
    const res = await fetch(`${API_ENDPOINTS.WALLET}/${id}`, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Gagal memperbarui wallet.",
      };
    }

    revalidatePath("/dashboard/wallets");
    return { success: true, message: "Wallet berhasil diperbarui!" };
  } catch (error) {
    console.error("Error updating wallet:", error);
    return { success: false, message: "Gagal terhubung ke server backend." };
  }
}

export async function deleteWallet(walletId: string) {
  try {
    const session = await getSession();
    const headers = await getAuthHeader();

    if (!session || !headers) {
      return { success: false, message: "Anda harus login terlebih dahulu." };
    }

    // Laravel DELETE menggunakan ID di URL dan kirim user_id di body/query
    const res = await fetch(
      `${API_ENDPOINTS.WALLET}/${walletId}?user_id=${session.userId}`,
      {
        method: "DELETE",
        headers: {
          ...headers,
          Accept: "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Gagal menghapus wallet.",
      };
    }

    revalidatePath("/dashboard/wallets");
    return { success: true, message: "Wallet berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleting wallet:", error);
    return { success: false, message: "Gagal terhubung ke server backend." };
  }
}

export async function transferBalance(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: "Unauthorized" };
    }

    const payload = {
      user_id: session.userId,
      from_wallet_id: formData.get("from_wallet_id"),
      to_wallet_id: formData.get("to_wallet_id"),
      amount: formData.get("amount"),
      date: formData.get("date"),
      description: formData.get("description") || "Transfer antar dompet",
    };

    // Validasi sederhana di server action
    if (payload.from_wallet_id === payload.to_wallet_id) {
      return { success: false, message: "Dompet asal dan tujuan tidak boleh sama." };
    }

    // Panggil API Transfer (Asumsi endpoint: POST /api/wallets/transfer)
    const res = await fetch(`${API_ENDPOINTS.TRANSFER}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Authorization: `Bearer ${token}` // Jika perlu token
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.message || "Transfer gagal." };
    }

    revalidatePath("/dashboard/wallets");
    return { success: true, message: "Transfer berhasil!" };
  } catch (error) {
    console.error("Transfer error:", error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}


