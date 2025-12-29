"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const job_title = formData.get("job_title");
    const estimated_monthly_income = formData.get("estimated_monthly_income");

    try {
      const res = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_title, estimated_monthly_income }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
        console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <img src="/assets/logo.png" alt="Nyimpen Logo" className="w-12 h-12 mx-auto mb-4 rounded-xl shadow-sm" />
          <h1 className="text-2xl font-bold text-slate-900">Lengkapi Profil Anda</h1>
          <p className="text-slate-500">Bantu kami mengenal Anda lebih baik untuk pengalaman yang lebih personal.</p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-rose-100 text-rose-700 rounded-lg text-sm text-center">
                {error}
            </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="job_title" className="block text-sm font-medium text-slate-700 mb-1">
              Pekerjaan
            </label>
            <input
              type="text"
              name="job_title"
              id="job_title"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              placeholder="Contoh: Software Engineer"
            />
          </div>
          <div>
            <label htmlFor="estimated_monthly_income" className="block text-sm font-medium text-slate-700 mb-1">
              Estimasi Pendapatan Bulanan
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
              <input
                type="number"
                name="estimated_monthly_income"
                id="estimated_monthly_income"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
                type="submit"
                disabled={loading}
                className="block w-full py-4 bg-slate-900 text-white rounded-xl font-semibold text-center hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50"
            >
                {loading ? "Menyimpan..." : "Simpan"}
            </button>
            
            <button
                type="button"
                onClick={handleSkip}
                className="block w-full py-4 bg-white text-slate-500 rounded-xl font-semibold text-center hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
            >
                Lewati untuk sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
