'use client'

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createTransaction, getWalletsAndCategories } from '@/app/api/transaction/actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex justify-center items-center shadow-lg shadow-slate-900/20 active:scale-[0.98]"
    >
      {pending ? (
        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
      ) : null}
      {pending ? 'Saving...' : 'Add Transaction'}
    </button>
  );
}

export default function AddTransactionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [wallets, setWallets] = useState<{ id: string, name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string, name: string, type: string }[]>([]);
  const [type, setType] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  async function loadData() {
    const data = await getWalletsAndCategories();
    setWallets(data.wallets);
    setCategories(data.categories);
  }

  async function clientAction(formData: FormData) {
    const result = await createTransaction(formData);
    if (result?.success) {
      setIsOpen(false);
    } else {
      alert(result?.message);
    }
  }

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
      >
        + Add New
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all text-slate-900 animate-in fade-in duration-300 overflow-y-auto py-12">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 relative">
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">New Transaction</h2>
                <p className="text-slate-500 text-sm">Add a record of your spending or income.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form action={clientAction} className="space-y-6">
              {/* Type Switcher */}
              <div className="flex p-1.5 bg-slate-100 rounded-2xl relative">
                <div 
                  className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${type === 'income' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'}`}
                ></div>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-xl relative z-10 transition-colors ${type === 'expense' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-xl relative z-10 transition-colors ${type === 'income' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Income
                </button>
                <input type="hidden" name="type" value={type} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Amount</label>
                  <div className="relative group">
                    <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-bold text-lg transition-colors ${type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>Rp</span>
                    <input 
                      type="number" 
                      name="amount" 
                      required
                      placeholder="0"
                      className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-xl font-bold placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Wallet Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Wallet</label>
                  <select 
                    name="wallet_id" 
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-slate-900 transition-all font-semibold appearance-none cursor-pointer"
                  >
                    <option value="">Select Wallet</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Category</label>
                  <select 
                    name="category_id" 
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-slate-900 transition-all font-semibold appearance-none cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {filteredCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Transaction Date</label>
                  <input 
                    type="date" 
                    name="transaction_date" 
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-slate-900 transition-all font-semibold cursor-pointer"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Description (Optional)</label>
                  <textarea 
                    name="description" 
                    rows={2}
                    placeholder="Wanna add a note?"
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-slate-900 transition-all font-semibold resize-none placeholder:text-slate-300"
                  ></textarea>
                </div>
              </div>

              <div className="pt-2">
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
