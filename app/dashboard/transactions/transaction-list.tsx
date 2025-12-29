'use client'

import { useState } from 'react';
import EditTransactionModal from './edit-transaction';
import DeleteTransaction from './delete-transaction';

// Helper for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper for date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  description: string | null;
  category: { id: string; name: string };
  wallet: { id: string; name: string };
  wallet_id: string;
  category_id: string;
}

interface Wallet {
  id: string;
  name: string;
}

export default function TransactionList({ 
  initialTransactions, 
  wallets 
}: { 
  initialTransactions: Transaction[],
  wallets: Wallet[]
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedWallet, setSelectedWallet] = useState<string>('all');

  // Filtering Logic
  const filteredTransactions = initialTransactions.filter(tx => {
    const matchesSearch = 
      (tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       tx.category.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesWallet = selectedWallet === 'all' || tx.wallet.id === selectedWallet;

    return matchesSearch && matchesType && matchesWallet;
  });

  // Group transactions by Month/Year
  const groupedTx = filteredTransactions.reduce((groups, tx) => {
    const date = new Date(tx.date);
    const groupKey = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(tx);
    return groups;
  }, {} as { [key: string]: Transaction[] });

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search description or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
            />
          </div>

          {/* Wallet Selector */}
          <div className="relative">
             <select 
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="w-full md:w-48 pl-4 pr-10 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold appearance-none cursor-pointer focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
             >
                <option value="all">All Wallets</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
             </select>
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>

        {/* Type Tabs */}
        <div className="flex gap-2">
           {['all', 'income', 'expense'].map((type) => (
             <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
             >
               {type}
             </button>
           ))}
        </div>
      </div>

      {/* List Section */}
      {filteredTransactions.length === 0 ? (
        <div className="py-20 text-center bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100">
           <p className="text-slate-400 font-medium">No transactions match your filters.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedTx).map(([month, txs]) => (
            <div key={month} className="space-y-4">
              <div className="flex items-center gap-4 px-2">
                <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] whitespace-nowrap">{month}</h2>
                <div className="h-px bg-slate-100 w-full"></div>
              </div>
              
              <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
                {txs.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-slate-50/80 transition-all group relative">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all group-hover:scale-110 ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-500/10' : 'bg-rose-50 text-rose-600 shadow-sm shadow-rose-500/10'}`}>
                        {tx.category.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{tx.description || tx.category.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider group-hover:bg-white transition-colors">{tx.wallet.name}</span>
                          <span className="text-slate-300 text-xs">•</span>
                          <span className="text-xs text-slate-400 font-medium">{formatDate(tx.date)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-2 transition-all group-hover:mr-0">
                        <p className={`font-black text-base ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                        </p>
                      </div>

                      {/* Action Buttons - reveal on hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <EditTransactionModal transaction={{
                          id: tx.id,
                          type: tx.type,
                          amount: tx.amount,
                          transaction_date: tx.date,
                          description: tx.description,
                          wallet_id: tx.wallet_id,
                          category_id: tx.category_id
                        }} />
                        <DeleteTransaction 
                          id={tx.id} 
                          description={tx.description || tx.category.name} 
                          amount={formatCurrency(tx.amount)} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
