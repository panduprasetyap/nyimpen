import { getDashboardStats } from "@/app/api/transaction/actions";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  type: "income" | "expense" | string;
  date: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(date);
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  if (!stats) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">
          Unable to load dashboard
        </h3>
        <p className="text-slate-500 text-sm mt-1">
          Please check your connection or try logging in again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500">Welcome back, {stats.userName}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <p className="text-slate-400 text-sm font-medium mb-1 relative z-10">
            Total Assets
          </p>
          <h2 className="text-3xl font-bold tracking-tight relative z-10">
            {formatCurrency(stats.totalAssets)}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group transition-all hover:border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Income ({stats.monthName})
          </p>
          <h2 className="text-2xl font-bold text-slate-900 transition-colors group-hover:text-emerald-600">
            {formatCurrency(stats.monthlyIncome)}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group transition-all hover:border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Expense ({stats.monthName})
          </p>
          <h2 className="text-2xl font-bold text-slate-900 transition-colors group-hover:text-rose-600">
            {formatCurrency(stats.monthlyExpense)}
          </h2>
        </div>
      </div>

      {/* Financial Health Widget */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">Financial Health</h3>
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
              stats.savingsRate >= 20
                ? "bg-emerald-100 text-emerald-700"
                : "bg-orange-100 text-orange-700"
            }`}>
            {stats.savingsRate >= 20 ? "Healthy" : "Needs Caution"}
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500 font-medium">
                Monthly Savings Rate
              </span>
              <span className="font-bold text-slate-900">
                {stats.savingsRate}%
              </span>
            </div>
            <div className="w-full bg-slate-50 rounded-full h-3 p-0.5">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  stats.savingsRate >= 20 ? "bg-emerald-500" : "bg-orange-500"
                }`}
                style={{
                  width: `${Math.min(Math.max(stats.savingsRate, 2), 100)}%`,
                }}></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 font-medium">
              Target: &gt; 20% (Financial Advisor Recommendation)
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-bold text-slate-900">Recent Transactions</h3>
          <a
            href="/dashboard/transactions"
            className="text-xs text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest transition-colors">
            View All
          </a>
        </div>
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {stats.recentTransactions.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm font-medium">
                No recent activity.
              </div>
            ) : (
              stats.recentTransactions.map((tx: Transaction) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        tx.type === "income"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}>
                      <span className="text-sm font-bold uppercase">
                        {tx.title?.[0] || tx.category[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {tx.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {tx.category} • {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-bold text-sm ${
                      tx.type === "income"
                        ? "text-emerald-600"
                        : "text-slate-900"
                    }`}>
                    {tx.type === "income" ? "+" : "-"}{" "}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
