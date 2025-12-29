'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function createWallet(formData: FormData) {
  try {
    const session = await getSession();
    
    if (!session || !session.userId) {
      return { success: false, message: 'Anda harus login terlebih dahulu.' };
    }

    const name = formData.get('name') as string;
    const type = formData.get('type') as any;
    const balance = Number(formData.get('balance')) || 0;

    if (!name || !type) {
      return { success: false, message: 'Data wallet tidak lengkap.' };
    }

    // Simpan ke database menggunakan Prisma
    await db.wallets.create({
      data: {
        name,
        type,
        balance,
        user_id: BigInt(session.userId as string),
      },
    });

    // Refresh data di halaman dashboard wallet
    revalidatePath('/dashboard/wallets');
    
    return { success: true, message: 'Wallet berhasil dibuat!' };

  } catch (error) {
    console.error('Error creating wallet:', error);
    return { success: false, message: 'Terjadi kesalahan sistem saat menyimpan wallet.' };
  }
}

export async function updateWallet(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: 'Anda harus login terlebih dahulu.' };
    }

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const type = formData.get('type') as any;

    if (!id || !name || !type) {
      return { success: false, message: 'Data wallet tidak lengkap.' };
    }

    await db.wallets.update({
      where: { 
        id: BigInt(id),
        user_id: BigInt(session.userId as string)
      },
      data: {
        name,
        type,
      },
    });

    revalidatePath('/dashboard/wallets');
    return { success: true, message: 'Wallet berhasil diperbarui!' };
  } catch (error) {
    console.error('Error updating wallet:', error);
    return { success: false, message: 'Terjadi kesalahan sistem saat memperbarui wallet.' };
  }
}

export async function deleteWallet(walletId: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: 'Anda harus login terlebih dahulu.' };
    }

    const id = BigInt(walletId);

    // Cek apakah wallet sudah memiliki transaksi
    const transactionCount = await db.transactions.count({
      where: { wallet_id: id },
    });

    if (transactionCount > 0) {
      return { 
        success: false, 
        message: 'Wallet tidak bisa dihapus karena sudah memiliki riwayat transaksi.' 
      };
    }

    await db.wallets.delete({
      where: { 
        id: id,
        user_id: BigInt(session.userId as string) 
      },
    });

    revalidatePath('/dashboard/wallets');
    return { success: true, message: 'Wallet berhasil dihapus!' };
  } catch (error) {
    console.error('Error deleting wallet:', error);
    return { success: false, message: 'Terjadi kesalahan sistem saat menghapus wallet.' };
  }
}