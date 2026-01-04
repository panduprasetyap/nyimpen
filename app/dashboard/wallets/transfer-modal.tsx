'use client'

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { transferBalance } from '@/app/api/wallet/actions'; // Sesuaikan path

interface Wallet {
  id: string | number;
  name: string;
  balance: string | number;
  type: string;
}

export default function TransferModal({ wallets }: { wallets: Wallet[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  // State untuk form logic
  const [fromId, setFromId] = useState<string>('');
  const [toId, setToId] = useState<string>('');
  
  const formRef = useRef<HTMLFormElement>(null);

  // Cari wallet yang sedang dipilih untuk menampilkan info saldo
  const selectedSourceWallet = wallets.find(w => w.id.toString() === fromId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    
    setIsPending(true);
    const formData = new FormData(formRef.current);
    
    const res = await transferBalance(formData);
    
    setIsPending(false);
    if (res.success) {
      setIsOpen(false);
      setFromId('');
      setToId('');
    } else {
      alert(res.message);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
        Transfer
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 relative">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">Transfer Funds</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              
              {/* FROM & TO SECTION */}
              <div className="relative space-y-4">
                {/* Source Wallet */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">From</label>
                  <select 
                    name="from_wallet_id" 
                    required
                    value={fromId}
                    onChange={(e) => setFromId(e.target.value)}
                    className="w-full bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select Source</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id} disabled={w.id.toString() === toId}>
                        {w.name} ({w.type})
                      </option>
                    ))}
                  </select>
                  {selectedSourceWallet && (
                    <div className="mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-lg">
                      Balance: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(selectedSourceWallet.balance))}
                    </div>
                  )}
                </div>

                {/* Arrow Icon Center */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                   <div className="bg-white p-2 rounded-full shadow-md border border-slate-100 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                   </div>
                </div>

                {/* Destination Wallet */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">To</label>
                  <select 
                    name="to_wallet_id" 
                    required
                    value={toId}
                    onChange={(e) => setToId(e.target.value)}
                    className="w-full bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select Destination</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id} disabled={w.id.toString() === fromId}>
                        {w.name} ({w.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-900">Rp</span>
                  <input 
                    type="number" 
                    name="amount" 
                    required
                    min="1"
                    max={selectedSourceWallet ? Number(selectedSourceWallet.balance) : undefined}
                    placeholder="0"
                    className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-slate-900 focus:outline-none transition-all font-bold text-xl"
                  />
                </div>
              </div>

              {/* Date & Desc */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                    <input 
                      type="date" 
                      name="date" 
                      required 
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 font-bold text-sm focus:border-slate-900 outline-none" 
                    />
                 </div>
                 <div className="col-span-2">
                    <input 
                      type="text" 
                      name="description" 
                      placeholder="Note (Optional)" 
                      className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 font-bold text-sm focus:border-slate-900 outline-none" 
                    />
                 </div>
              </div>

              <button
                type="submit"
                disabled={isPending || !fromId || !toId}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-900/10 active:scale-95"
              >
                {isPending ? 'Processing...' : 'Confirm Transfer'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}