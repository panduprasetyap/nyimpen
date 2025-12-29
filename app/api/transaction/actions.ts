'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession, getCurrentUser } from '@/lib/auth';

export async function createTransaction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: 'Anda harus login terlebih dahulu.' };
    }

    const userId = BigInt(session.userId as string);
    const walletId = BigInt(formData.get('wallet_id') as string);
    const categoryId = BigInt(formData.get('category_id') as string);
    const amount = Number(formData.get('amount'));
    const type = formData.get('type') as 'income' | 'expense';
    const transactionDate = new Date(formData.get('transaction_date') as string);
    const description = formData.get('description') as string;

    if (!walletId || !categoryId || !amount || !type || !transactionDate) {
      return { success: false, message: 'Data transaksi tidak lengkap.' };
    }

    // Perform atomic transaction: create record + update wallet balance
    await db.$transaction(async (tx) => {
      // 1. Create the transaction
      await tx.transactions.create({
        data: {
          user_id: userId,
          wallet_id: walletId,
          category_id: categoryId,
          amount: amount,
          type: type,
          transaction_date: transactionDate,
          description: description,
        },
      });

      // 2. Update wallet balance
      const balanceChange = type === 'income' ? amount : -amount;
      await tx.wallets.update({
        where: { id: walletId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });
    });

    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/wallets');
    revalidatePath('/dashboard');

    return { success: true, message: 'Transaksi berhasil disimpan!' };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return { success: false, message: 'Terjadi kesalahan sistem saat menyimpan transaksi.' };
  }
}

export async function getTransactions() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return [];

    const userId = BigInt(session.userId as string);

    const transactions = await db.transactions.findMany({
      where: { user_id: userId },
      include: {
        categories: true,
        wallets: true,
      },
      orderBy: {
        transaction_date: 'desc',
      },
    });

    // Serialize BigInt and dates
    return transactions.map((tx) => ({
      id: tx.id.toString(),
      type: tx.type,
      amount: Number(tx.amount),
      date: tx.transaction_date.toISOString(),
      description: tx.description,
      wallet_id: tx.wallet_id.toString(),
      category_id: tx.category_id.toString(),
      category: {
        id: tx.categories.id.toString(),
        name: tx.categories.name,
      },
      wallet: {
        id: tx.wallets.id.toString(),
        name: tx.wallets.name,
      },
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function getWalletsAndCategories() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { wallets: [], categories: [] };

    const userId = BigInt(session.userId as string);

    const wallets = await db.wallets.findMany({
      where: { user_id: userId, is_active: true },
      orderBy: { name: 'asc' },
    });

    const categories = await db.categories.findMany({
      where: { user_id: userId },
      orderBy: { name: 'asc' },
    });

    return {
      wallets: wallets.map(w => ({ id: w.id.toString(), name: w.name })),
      categories: categories.map(c => ({ id: c.id.toString(), name: c.name, type: c.type })),
    };
  } catch (error) {
    console.error('Error fetching wallets/categories:', error);
    return { wallets: [], categories: [] };
  }
}

export async function getDashboardStats() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return null;

    const userId = BigInt(session.userId as string);
    const user = await getCurrentUser();

    // 1. Total Assets
    const wallets = await db.wallets.findMany({
      where: { user_id: userId, is_active: true }
    });
    const totalAssets = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

    // 2. Monthly Stats (Current Month)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyTransactions = await db.transactions.findMany({
      where: {
        user_id: userId,
        transaction_date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    const monthlyIncome = monthlyTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const monthlyExpense = monthlyTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    // 3. Savings Rate
    const savingsRate = monthlyIncome > 0 
      ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100) 
      : 0;

    // 4. Recent Transactions
    const recentTransactionsRaw = await db.transactions.findMany({
      where: { user_id: userId },
      include: { categories: true },
      orderBy: { transaction_date: 'desc' },
      take: 5,
    });

    const recentTransactions = recentTransactionsRaw.map(tx => ({
      id: tx.id.toString(),
      title: tx.description || tx.categories.name,
      category: tx.categories.name,
      amount: Number(tx.amount),
      type: tx.type,
      date: tx.transaction_date.toISOString(),
    }));

    return {
      userName: user?.name || 'User',
      totalAssets,
      monthlyIncome,
      monthlyExpense,
      savingsRate,
      recentTransactions,
      monthName: new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(now),
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return null;
  }
}

export async function deleteTransaction(id: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: 'Anda harus login terlebih dahulu.' };
    }

    const transactionId = BigInt(id);

    await db.$transaction(async (tx) => {
      // 1. Fetch old transaction
      const transaction = await tx.transactions.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) throw new Error('Transaksi tidak ditemukan.');

      // 2. Revert wallet balance
      const balanceRevert = transaction.type === 'income' ? -Number(transaction.amount) : Number(transaction.amount);
      await tx.wallets.update({
        where: { id: transaction.wallet_id },
        data: {
          balance: {
            increment: balanceRevert,
          },
        },
      });

      // 3. Delete transaction
      await tx.transactions.delete({
        where: { id: transactionId },
      });
    });

    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/wallets');
    revalidatePath('/dashboard');

    return { success: true, message: 'Transaksi berhasil dihapus!' };
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return { success: false, message: error.message || 'Terjadi kesalahan sistem saat menghapus transaksi.' };
  }
}

export async function updateTransaction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: 'Anda harus login terlebih dahulu.' };
    }

    const id = BigInt(formData.get('id') as string);
    const walletId = BigInt(formData.get('wallet_id') as string);
    const categoryId = BigInt(formData.get('category_id') as string);
    const amount = Number(formData.get('amount'));
    const type = formData.get('type') as 'income' | 'expense';
    const transactionDate = new Date(formData.get('transaction_date') as string);
    const description = formData.get('description') as string;

    await db.$transaction(async (tx) => {
      // 1. Fetch old transaction
      const oldTx = await tx.transactions.findUnique({
        where: { id },
      });

      if (!oldTx) throw new Error('Transaksi tidak ditemukan.');

      // 2. Revert old wallet balance
      const oldBalanceRevert = oldTx.type === 'income' ? -Number(oldTx.amount) : Number(oldTx.amount);
      await tx.wallets.update({
        where: { id: oldTx.wallet_id },
        data: {
          balance: {
            increment: oldBalanceRevert,
          },
        },
      });

      // 3. Apply new wallet balance
      const newBalanceChange = type === 'income' ? amount : -amount;
      await tx.wallets.update({
        where: { id: walletId },
        data: {
          balance: {
            increment: newBalanceChange,
          },
        },
      });

      // 4. Update transaction
      await tx.transactions.update({
        where: { id },
        data: {
          wallet_id: walletId,
          category_id: categoryId,
          amount: amount,
          type: type,
          transaction_date: transactionDate,
          description: description,
        },
      });
    });

    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/wallets');
    revalidatePath('/dashboard');

    return { success: true, message: 'Transaksi berhasil diupdate!' };
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return { success: false, message: error.message || 'Terjadi kesalahan sistem saat mengedit transaksi.' };
  }
}
