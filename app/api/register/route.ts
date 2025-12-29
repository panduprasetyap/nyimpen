import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default Categories
    const defaultIncome = [
      "Gaji", 
      "Bonus & Tunjangan", 
      "Hasil Usaha/Sampingan", 
      "Investasi", 
      "Pemasukan Lainnya"
    ];

    const defaultExpense = [
      "Makanan & Minuman", 
      "Transportasi", 
      "Belanja Harian", 
      "Tagihan & Utilitas", 
      "Tempat Tinggal",
      "Hiburan & Hobi", 
      "Kesehatan", 
      "Pendidikan", 
      "Cicilan & Utang", 
      "Donasi & Sosial", 
      "Pengeluaran Lainnya"
    ];

    // Transaction: Create User -> Create Categories
    const newUser = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // 2. Prepare Category Data
      const incomeData = defaultIncome.map(catName => ({
        user_id: user.id,
        name: catName,
        type: 'income' as const
      }));

      const expenseData = defaultExpense.map(catName => ({
        user_id: user.id,
        name: catName,
        type: 'expense' as const
      }));

      // 3. Insert Categories
      await tx.categories.createMany({
        data: [...incomeData, ...expenseData],
      });

      return user;
    });

    return NextResponse.json({ 
      message: "Registration successful", 
      user: {
        id: newUser.id.toString(), // Convert BigInt to string
        name: newUser.name,
        email: newUser.email
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
