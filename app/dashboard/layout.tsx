import Link from "next/link";
import { cookies } from "next/headers";
import { jwtVerify } from "jose"; // Pastikan install jose

import { getCurrentUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/api-config";

const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_me");

async function getFreshUserProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const targetUrl = `${API_ENDPOINTS.PROFILE}?id=${userId}`;
    
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch profile from backend:", res.status);
      return null;
    }

    const result = await res.json();
    
    return result.data || result;

  } catch (error) {
    console.error("Error getting fresh user profile:", error);
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getFreshUserProfile();

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64 transition-all">
      {/* Sidebar for Desktop */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 hidden md:flex flex-col text-white z-20">
        <div className="p-6 flex items-center gap-3">
          <img src="/assets/logo.png" alt="Nyimpen Logo" className="w-8 h-8 rounded-lg" />
          <h1 className="text-2xl font-bold tracking-tight">Nyimpen</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavLink href="/dashboard" icon={<HomeIcon />} label="Overview" />
          <NavLink href="/dashboard/transactions" icon={<ListIcon />} label="Transactions" />
          <NavLink href="/dashboard/wallets" icon={<WalletIcon />} label="Wallets" />
          <NavLink href="/dashboard/settings" icon={<SettingsIcon />} label="Settings" />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                {user?.photos ? (
                    <img src={`${NEXT_PUBLIC_API_URL}${user.photos}`} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-slate-600">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                )}
            </div>
            <div className="text-sm">
              <p className="font-medium truncate max-w-[140px]">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate max-w-[140px]">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-4xl mx-auto md:mx-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-20 flex justify-around items-center px-2 py-3 shadow-lg pb-safe">
        <MobileNavLink href="/dashboard" icon={<HomeIcon />} label="Home" />
        <MobileNavLink href="/dashboard/transactions" icon={<ListIcon />} label="Trans" />
        <MobileNavLink href="/dashboard/wallets" icon={<WalletIcon />} label="Wallets" />
        <MobileNavLink href="/dashboard/settings" icon={<SettingsIcon />} label="Settings" />
      </nav>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function MobileNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-slate-900 transition-colors">
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

// Simple Icons to avoid dependencies
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
);
const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
