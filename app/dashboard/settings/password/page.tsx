"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PasswordPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error on change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
        setError("New passwords do not match");
        return;
    }

    if (formData.newPassword.length < 6) {
        setError("Password must be at least 6 characters");
        return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Password updated successfully");
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(data.message || "Failed to update password");
      }
    } catch (e) {
      console.error(e);
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Change Password</h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg">
                    {success}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <input 
                    type="password" 
                    name="currentPassword"
                    value={formData.currentPassword} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input 
                    type="password" 
                    name="newPassword"
                    value={formData.newPassword} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                />
            </div>

            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {saving && <Loader2 className="animate-spin w-4 h-4" />}
                    Update Password
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
