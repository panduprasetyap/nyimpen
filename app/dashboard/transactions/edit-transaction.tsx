'use client'

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { updateTransaction, getWalletsAndCategories } from '@/app/api/transaction/actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex justify-center items-center shadow-lg shadow-slate-900/20 active:scale-[0.98]"
    >
      {pending ? (
        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
      ) : null}
      {pending ? 'Updating...' : 'Save Changes'}
    </button>
  );
}

interface EditTransactionProps {
  transaction: {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    transaction_date: string;
    description: string | null;
    wallet_id: string;
    category_id: string;
  };
}

export default function EditTransactionModal({ transaction }: EditTransactionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [wallets, setWallets] = useState<{ id: string, name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string, name: string, type: string }[]>([]);
  const [type, setType] = useState<'income' | 'expense'>(transaction.type);

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
    const result = await updateTransaction(formData);
    if (result?.success) {
      setShowConfirm(false);
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
        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
        title="Edit Transaction"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all text-slate-900 animate-in fade-in duration-300 overflow-y-auto py-12">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-12 duration-300 relative border border-slate-100">
            
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Edit Transaction</h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Modify your financial record.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form action={() => setShowConfirm(true)} className="space-y-8">
              <input type="hidden" name="id" value={transaction.id} />
              
              {/* Type Switcher */}
              <div className="flex p-2 bg-slate-50 rounded-2xl relative">
                <div 
                  className={`absolute top-2 bottom-2 w-[calc(50%-8px)] bg-white rounded-xl shadow-sm transition-all duration-500 ease-in-out ${type === 'income' ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'}`}
                ></div>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl relative z-10 transition-colors ${type === 'expense' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl relative z-10 transition-colors ${type === 'income' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Income
                </button>
                <input type="hidden" name="type" value={type} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Amount */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Amount</label>
                  <div className="relative group">
                    <span className={`absolute left-6 top-1/2 -translate-y-1/2 font-black text-xl transition-colors ${type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>Rp</span>
                    <input 
                      type="number" 
                      name="amount" 
                      required
                      defaultValue={transaction.amount}
                      className="w-full pl-14 pr-6 py-5 rounded-3xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-2xl font-black placeholder:text-slate-200"
                    />
                  </div>
                </div>

                {/* Wallet & Category */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Wallet</label>
                  <select 
                    name="wallet_id" 
                    required
                    defaultValue={transaction.wallet_id}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-all font-bold appearance-none cursor-pointer"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Category</label>
                  <select 
                    name="category_id" 
                    required
                    defaultValue={transaction.category_id}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-all font-bold appearance-none cursor-pointer"
                  >
                    {filteredCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Date</label>
                  <input 
                    type="date" 
                    name="transaction_date" 
                    required
                    defaultValue={transaction.transaction_date.split('T')[0]}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-all font-bold cursor-pointer"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Notes</label>
                  <textarea 
                    name="description" 
                    rows={2}
                    defaultValue={transaction.description || ''}
                    placeholder="Wanna add a note?"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-all font-bold resize-none placeholder:text-slate-200"
                  ></textarea>
                </div>
              </div>

              <div className="pt-4">
                 <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white py-4 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 active:scale-95"
                 >
                   Update Records
                 </button>
              </div>

              {/* Confirmation Overlay within Modal */}
              {showConfirm && (
                <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-300">
                  <div className="max-w-sm text-center">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Save Changes?</h3>
                    <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">
                      Confirming this will update your transaction details and re-calculate your wallet balance.
                    </p>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                      >
                        Go Back
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const form = document.querySelector('form') as HTMLFormElement;
                          clientAction(new FormData(form));
                        }}
                        className="flex-[2] px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all active:scale-95"
                      >
                         Confirm & Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
