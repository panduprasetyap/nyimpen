"use server";

import { revalidatePath } from "next/cache";
import { getSession, getCurrentUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/api-config";

// --- ACTIONS ---

export async function createTransaction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: "Anda harus login terlebih dahulu." };
    }

    // Persiapkan payload JSON untuk dikirim ke Laravel
    const payload = {
      // Auth fallback sesuai logic Laravel Controller sebelumnya
      id: session.userId,

      wallet_id: formData.get("wallet_id"),
      category_id: formData.get("category_id"),
      amount: formData.get("amount"),
      type: formData.get("type"),
      transaction_date: formData.get("transaction_date"),
      description: formData.get("description"),
    };

    const res = await fetch(API_ENDPOINTS.CREATE_TRANSACTION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Gagal menyimpan transaksi.",
      };
    }

    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/wallets");
    revalidatePath("/dashboard");

    return { success: true, message: "Transaksi berhasil disimpan!" };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem saat menghubungi server.",
    };
  }
}

export async function getTransactions() {
  try {
  
    const session = await getSession();
    if (!session || !session.userId) return [];

    const res = await fetch(
      `${API_ENDPOINTS.TRANSACTIONS}?id=${session.userId}`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );

    if (!res.ok) return [];


    const result = await res.json();

    const transactions = Array.isArray(result) ? result : result.data || [];

    return transactions.map((tx: any) => ({
      id: tx.id.toString(),
      type: tx.type,
      amount: Number(tx.amount),
      date: tx.transaction_date,
      description: tx.description,
      wallet_id: tx.wallet_id.toString(),
      category_id: tx.category_id.toString(),
      category: {
        id: tx.category?.id.toString() || "",
        name: tx.category?.name || "",
      },
      wallet: {
        id: tx.wallet?.id.toString() || "",
        name: tx.wallet?.name || "",
      },
    }));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export async function getWalletsAndCategories() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { wallets: [], categories: [] };

    // Fetch endpoint 'create' di Laravel yang return data wallet & categories
    const res = await fetch(`${API_ENDPOINTS.WALLET_CATEGORY}?id=${session.userId}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return { wallets: [], categories: [] };

    const data = await res.json();

    // Mapping data
    return {
      wallets: (data.wallets || []).map((w: any) => ({
        id: w.id.toString(),
        name: w.name,
      })),
      categories: (data.categories || []).map((c: any) => ({
        id: c.id.toString(),
        name: c.name,
        type: c.type,
      })),
    };
  } catch (error) {
    console.error("Error fetching wallets/categories:", error);
    return { wallets: [], categories: [] };
  }
}

export async function getDashboardStats() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return null;

    // Karena route Laravel menggunakan POST, kita kirim ID di body
    const payload = {
      id: session.userId, // ID untuk autentikasi manual di Laravel Controller
    };

    const res = await fetch(API_ENDPOINTS.DASHBOARD, {
      method: "POST", // Sesuai permintaan Route::post
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store", // Pastikan data selalu fresh
    });

    if (!res.ok) {
      const errorText = await res.text(); // Baca sebagai text dulu
      console.error("Error Status:", res.status);
      console.error("Error Body:", errorText); // Lihat isi error HTML/JSON-nya
      return null;
    }

    const data = await res.json();

    return {
      userName: data.user?.name || "User",
      totalAssets: Number(data.totalAssets || 0),
      monthlyIncome: Number(data.monthlyIncome || 0),
      monthlyExpense: Number(data.monthlyExpense || 0),
      savingsRate: Number(data.savingsRate || 0),
      monthName: data.monthName,
      recentTransactions: (data.recentTransactions || []).map((tx: any) => ({
        id: tx.id.toString(),
        // Mapping field dari JSON Laravel
        title: tx.title || tx.description || "No Description",
        category: tx.category,
        amount: Number(tx.amount),
        type: tx.type,
        date: tx.date, // Pastikan format date dari Laravel sesuai (ISO string)
      })),
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return null;
  }
}

export async function deleteTransaction(id: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: "Anda harus login terlebih dahulu." };
    }

    // Pass user_id via query param atau body agar validasi di Laravel lolos
    const res = await fetch(
      `${API_ENDPOINTS.TRANSACTIONS}/${id}?id=${session.userId}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Gagal menghapus transaksi.",
      };
    }

    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/wallets");
    revalidatePath("/dashboard");

    return { success: true, message: "Transaksi berhasil dihapus!" };
  } catch (error: any) {
    console.error("Error deleting transaction:", error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem saat menghapus transaksi.",
    };
  }
}

export async function updateTransaction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: "Anda harus login terlebih dahulu." };
    }

    const id = formData.get("id") as string;

    const payload = {
      // Auth fallback
      user_id: session.userId,

      wallet_id: formData.get("wallet_id"),
      category_id: formData.get("category_id"),
      amount: formData.get("amount"),
      type: formData.get("type"),
      transaction_date: formData.get("transaction_date"),
      description: formData.get("description"),
    };

    console.log(payload);

    const res = await fetch(`${API_ENDPOINTS.TRANSACTIONS}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    console.log(data);

    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Gagal mengupdate transaksi.",
      };
    }

    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/wallets");
    revalidatePath("/dashboard");

    return { success: true, message: "Transaksi berhasil diupdate!" };
  } catch (error: any) {
    console.error("Error updating transaction:", error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem saat mengedit transaksi.",
    };
  }
}
