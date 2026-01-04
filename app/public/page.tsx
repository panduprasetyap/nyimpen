'use client'

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [showContact, setShowContact] = useState(false);
  const [copied, setCopied] = useState(false);

  const email = "prasetya038@gmail.com"; // Ganti dengan email asli

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset status setelah 2 detik
  };
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="Nyimpen Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">Nyimpen.</span>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/public/login" 
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              Masuk
            </Link>
            <Link 
              href="/public/register" 
              className="hidden md:inline-flex bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mb-8">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">Baru: Skor Kesehatan Finansial</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
            Satu Dashboard untuk <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Semua Dompet & Aset
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Berhenti menebak kemana uang Anda pergi. Pantau Rekening Bank, E-Wallet, dan Uang Tunai secara real-time. 
            Monitor arus kas dan bangun masa depan finansial yang lebih sehat.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link
              href="/public/register"
              className="w-full md:w-auto bg-slate-900 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Mulai Catat Sekarang
            </Link>

          </div>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl -z-10 opacity-40 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-200 rounded-full blur-3xl opacity-30 mix-blend-multiply animate-blob"></div>
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30 mix-blend-multiply animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-30 mix-blend-multiply animate-blob animation-delay-4000"></div>
        </div>
      </header>

      {/* Feature Grid */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Mengapa Memilih Nyimpen?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Kami mengatasi kerumitan uang yang tersebar di berbagai rekening bank dan e-wallet Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Manajemen Multi-Dompet</h3>
              <p className="text-slate-600 leading-relaxed">
                Hubungkan dan kelola sumber dana tanpa batas. Baik itu Bank untuk tabungan, E-Wallet untuk perjalanan, atau Tunai untuk jajan—lihat semuanya dalam satu tampilan.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Indikator Kesehatan</h3>
              <p className="text-slate-600 leading-relaxed">
                Jangan hanya mencatat, <span className="font-semibold text-slate-900">pahami</span>. Kami menghitung Rasio Tabungan (Savings Rate) untuk membantu Anda tetap berada di zona "Sehat" (20%).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Arus Kas Pintar</h3>
              <p className="text-slate-600 leading-relaxed">
                Pantau Pemasukan vs Pengeluaran secara real-time. Temukan defisit sebelum terjadi dan sesuaikan kebiasaan belanja Anda dengan cepat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-slate-900 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
           <div className="relative z-10 space-y-8">
             <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Siap mengatur uang Anda?</h2>
             <p className="text-slate-300 text-lg max-w-xl mx-auto">
               Bergabunglah dengan ribuan pengguna yang telah beralih ke sistem pencatatan cerdas hari ini.
             </p>
             <Link
                href="/public/register"
                className="inline-block bg-white text-slate-900 font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-emerald-50 transition-all active:scale-95"
              >
                Buat Akun Gratis
              </Link>
           </div>
           
           {/* Decor */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">© 2025 Nyimpen inc.</p>
          <div className="flex gap-6">
          <button 
              onClick={() => setShowContact(true)}
              className="text-slate-400 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              Kontak
            </button>
          </div>
        </div>
      </footer>
      {showContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowContact(false)}
          ></div>

          {/* Modal Content */}
          <div className="bg-white rounded-[32px] shadow-2xl p-8 w-full max-w-sm relative z-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 border border-slate-100">
            
            {/* Tombol Close (X) */}
            <button 
              onClick={() => setShowContact(false)}
              className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {/* Icon Header */}
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 mx-auto ring-8 ring-blue-50/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Hubungi Kami</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Punya pertanyaan atau saran? Tim support kami siap membantu Anda.
              </p>
            </div>

            {/* Email Copy Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 mb-6 group hover:border-blue-200 transition-colors">
              <span className="font-bold text-slate-700 text-sm truncate">{email}</span>
              
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <svg className="text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span className="text-emerald-600">Disalin!</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            {/* Tombol Kirim Email Langsung */}
            <a 
              href={`mailto:${email}`}
              className="block w-full bg-slate-900 text-white text-center font-bold py-3.5 rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
            >
              Kirim Email
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
