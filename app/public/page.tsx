import Link from "next/link";

export default function LandingPage() {
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
              Log In
            </Link>
            <Link 
              href="/public/register" 
              className="hidden md:inline-flex bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mb-8">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">New: Financial Health Score</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
            One Dashboard for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Every Wallet & Asset
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop guessing where your money goes. Track BCA, GoPay, OVO, and Cash in real-time. 
            Monitor your cashflow and build a healthier financial future.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link
              href="/public/register"
              className="w-full md:w-auto bg-slate-900 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Start Tracking Now
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
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Professional Trackers Choose Nyimpen</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We solve the chaos of having money scattered across multiple bank accounts and e-wallets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-Wallet Management</h3>
              <p className="text-slate-600 leading-relaxed">
                Connect and manage unlimited sources. Whether it’s BCA for savings, GoPay for rides, or Cash for daily snacks—see it all in one view.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Health Indicators</h3>
              <p className="text-slate-600 leading-relaxed">
                Don't just track, <span className="font-semibold text-slate-900">understand</span>. We calculate your Savings Rate helping you stay in the "Healthy" zone (&gt;20%).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Cashflow</h3>
              <p className="text-slate-600 leading-relaxed">
                Real-time income vs expense monitoring. Spot deficits before they happen and adjust your spending habits instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-slate-900 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
           <div className="relative z-10 space-y-8">
             <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to master your money?</h2>
             <p className="text-slate-300 text-lg max-w-xl mx-auto">
               Join thousands of users who have switched to a smarter, multi-wallet based tracking system today.
             </p>
             <Link
                href="/public/register"
                className="inline-block bg-white text-slate-900 font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-emerald-50 transition-all active:scale-95"
              >
                Create Free Account
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
          <p className="text-slate-500 text-sm">© 2025 Nyimpen inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-slate-900 text-sm font-medium">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-slate-900 text-sm font-medium">Terms</a>
            <a href="#" className="text-slate-400 hover:text-slate-900 text-sm font-medium">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
