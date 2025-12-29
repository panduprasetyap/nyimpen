"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

export default function SettingsPage() {
  const router = useRouter();
  const [view, setView] = useState<"menu" | "categories">("menu");
  
  // Category State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<"income" | "expense">("expense");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/public/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "categories") {
      fetchCategories();
    }
  }, [view]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
        const res = await fetch("/api/categories", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ name: newCatName, type: newCatType })
        });
        if (res.ok) {
            setNewCatName("");
            fetchCategories();
        }
    } catch (e) {
        console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
        const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
        if (res.ok) {
            fetchCategories();
            setErrorMessage("");
        } else {
            const data = await res.json();
            setErrorMessage(data.message || "Failed to delete");
             setTimeout(() => setErrorMessage(""), 3000);
        }
    } catch (e) {
        setErrorMessage("Failed to delete");
    }
  };

  const handleUpdate = async (id: string, name: string, type: "income" | "expense") => {
      try {
          const res = await fetch(`/api/categories?id=${id}`, {
              method: "PUT",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({ name, type })
          });
          if (res.ok) {
              setEditingId(null);
              fetchCategories();
          }
      } catch (e) {
          console.error(e);
      }
  };

  const startEditing = (cat: Category) => {
      setEditingId(cat.id);
      setNewCatName(cat.name);
      setNewCatType(cat.type);
  }

  // Sub-component for editing row could be extracted, but keeping inline for simplicity as requested "tetep viewnya dibagian dashboard/settings"

  if (view === "categories") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView("menu")}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Manage Categories</h1>
        </div>

        {errorMessage && (
            <div className="p-3 bg-rose-100 text-rose-700 rounded-lg text-sm mb-4">
                {errorMessage}
            </div>
        )}

        {/* Add New Category */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-4">Add New Category</h3>
            <form onSubmit={handleCreate} className="flex gap-4">
                <input 
                    type="text" 
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Category Name"
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                />
                <select 
                    value={newCatType}
                    onChange={(e) => setNewCatType(e.target.value as "income" | "expense")}
                    className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
                >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
                <button 
                    type="submit"
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                >
                    Add
                </button>
            </form>
        </div>

        {/* List */}
        <div className="space-y-6">
            {loading ? (
                 <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">Loading categories...</div>
            ) : (
                <>
                    {/* Expense Section */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-rose-500" />
                             Expenses
                        </h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                             {categories.filter(c => c.type === 'expense').length > 0 ? (
                                categories.filter(c => c.type === 'expense').map((cat) => (
                                    <CategoryItem 
                                        key={cat.id} 
                                        cat={cat} 
                                        editingId={editingId} 
                                        startEditing={startEditing} 
                                        handleDelete={handleDelete} 
                                        handleUpdate={handleUpdate} 
                                        setEditingId={setEditingId}
                                    />
                                ))
                             ) : (
                                <div className="p-6 text-center text-slate-400 text-sm">No expense categories yet.</div>
                             )}
                        </div>
                    </div>

                    {/* Income Section */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500" />
                             Incomes
                        </h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                             {categories.filter(c => c.type === 'income').length > 0 ? (
                                categories.filter(c => c.type === 'income').map((cat) => (
                                    <CategoryItem 
                                        key={cat.id} 
                                        cat={cat} 
                                        editingId={editingId} 
                                        startEditing={startEditing} 
                                        handleDelete={handleDelete} 
                                        handleUpdate={handleUpdate} 
                                        setEditingId={setEditingId}
                                    />
                                ))
                             ) : (
                                <div className="p-6 text-center text-slate-400 text-sm">No income categories yet.</div>
                             )}
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>
    );
  }

  // Default Menu View
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
        <div 
            onClick={() => setView("categories")}
            className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <h4 className="font-bold text-slate-900">Manage Categories</h4>
          <p className="text-sm text-slate-500">Customize your expense and income categories</p>
        </div>
        
        <Link href="/dashboard/settings/profile">
            <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <h4 className="font-bold text-slate-900">Profile</h4>
            <p className="text-sm text-slate-500">Update email and personal details</p>
            </div>
        </Link>

        <Link href="/dashboard/settings/password">
            <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <h4 className="font-bold text-slate-900">Password</h4>
            <p className="text-sm text-slate-500">Change your account password</p>
            </div>
        </Link>

        <div 
          onClick={handleLogout}
          className="p-4 hover:bg-slate-50 transition-colors cursor-pointer text-rose-600"
        >
          <h4 className="font-bold">Log Out</h4>
        </div>
      </div>
    </div>
  );
}

function CategoryItem({ cat, editingId, startEditing, handleDelete, handleUpdate, setEditingId }: any) {
    return (
        <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50 group">
            {editingId === cat.id ? (
                <div className="flex gap-2 flex-1 items-center">
                    <input 
                    type="text" 
                    defaultValue={cat.name}
                    id={`edit-name-${cat.id}`}
                    className="flex-1 px-3 py-1 rounded-lg border border-slate-200 text-sm"
                    />
                    <select 
                    defaultValue={cat.type}
                    id={`edit-type-${cat.id}`}
                    className="px-3 py-1 rounded-lg border border-slate-200 text-sm bg-white"
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                    <button 
                    onClick={() => {
                        const nameInput = document.getElementById(`edit-name-${cat.id}`) as HTMLInputElement;
                        const typeInput = document.getElementById(`edit-type-${cat.id}`) as HTMLSelectElement;
                        handleUpdate(cat.id, nameInput.value, typeInput.value as "income" | "expense");
                    }}
                    className="text-emerald-600 font-medium text-sm hover:underline"
                    >
                        Save
                    </button>
                    <button 
                    onClick={() => setEditingId(null)}
                    className="text-slate-500 font-medium text-sm hover:underline"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <>
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${cat.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-slate-900 font-medium">{cat.name}</span>
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-full capitalize hidden">{cat.type}</span>
                </div>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => startEditing(cat)}
                        className="text-sm text-slate-500 hover:text-slate-900"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => handleDelete(cat.id)}
                        className="text-sm text-rose-500 hover:text-rose-700"
                    >
                        Delete
                    </button>
                </div>
                </>
            )}
        </div>
    )
}
