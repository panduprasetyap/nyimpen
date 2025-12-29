import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma, categories_type } from "@prisma/client";
import bcrypt from "bcryptjs";

// 1. Helper Function: Pembasmi Null Byte (0x00) & Control Characters
// Postgres akan crash jika ada karakter ini di dalam string
function sanitize(input: string): string {
  if (!input) return "";
  // Hapus null byte (\x00) dan karakter kontrol lainnya yang tidak perlu
  // \x7F adalah karakter delete
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

function debugString(label: string, str: string) {
  if (/\x00/.test(str)) {
    console.error(`CRITICAL: Null byte detected in ${label}!`);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Ambil data dan pastikan string (handle jika undefined/null)
    const rawName = body.name ? String(body.name) : "";
    const rawEmail = body.email ? String(body.email) : "";
    const rawPassword = body.password ? String(body.password) : "";

    // 2. Validasi Input Dasar
    if (!rawName || !rawEmail || !rawPassword) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // 3. Sanitasi Input (PENTING untuk Postgres)
    const name = sanitize(rawName);
    const email = sanitize(rawEmail).toLowerCase(); // Email sebaiknya lowercase
    const password = sanitize(rawPassword);

    console.log("Registering User:", { name, email }); // Debug log

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default Categories Data
    const defaultIncome = [
      "Gaji", "Bonus & Tunjangan", "Hasil Usaha/Sampingan", 
      "Investasi", "Pemasukan Lainnya"
    ];

    const defaultExpense = [
      "Makanan & Minuman", "Transportasi", "Belanja Harian", 
      "Tagihan & Utilitas", "Tempat Tinggal", "Hiburan & Hobi", 
      "Kesehatan", "Pendidikan", "Cicilan & Utang", 
      "Donasi & Sosial", "Pengeluaran Lainnya"
    ];

    // Transaction: Create User -> Create Categories
    const newUser = await db.$transaction(async (tx) => {
      // DEBUG: Cek jika ada yang lolos
      debugString("name", name);
      debugString("email", email);
      debugString("hashedPassword", hashedPassword);

      // 1. Create User
      const user = await tx.user.create({
        data: {
          name: sanitize(name),
          email: sanitize(email),
          password: sanitize(hashedPassword),
        },
      });

      // 2. Prepare Category Data
      // Pastikan type-casting ID ke BigInt jika perlu (biasanya otomatis, tapi kita jaga-jaga)
      const incomeData = defaultIncome.map(catName => ({
        user_id: user.id,
        name: sanitize(catName),
        type: categories_type.income,
      }));

      const expenseData = defaultExpense.map(catName => ({
        user_id: user.id,
        name: sanitize(catName),
        type: categories_type.expense,
      }));

      // 3. Insert Categories
      // Menggunakan createMany untuk performa lebih baik
      if (incomeData.length > 0 || expenseData.length > 0) {
        await tx.categories.createMany({
          data: [...incomeData, ...expenseData],
        });
      }

      return user;
    });

    return NextResponse.json({ 
      message: "Registration successful", 
      user: {
        id: newUser.id.toString(), // Convert BigInt to string safe for JSON
        name: newUser.name,
        email: newUser.email
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Registration Error Detailed:", error);
    
    // Return pesan error spesifik jika ada (untuk debugging di Postman/Frontend)
    return NextResponse.json({ 
      message: "Internal server error", 
      detail: error.message 
    }, { status: 500 });
  }
}