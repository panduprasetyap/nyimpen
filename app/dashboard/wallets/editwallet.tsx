'use client'

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { updateWallet } from '@/app/api/wallet/actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
    >
      {pending ? (
        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
      ) : null}
      {pending ? 'Updating...' : 'Update Wallet'}
    </button>
  );
}

interface EditWalletModalProps {
  wallet: {
    id: string;
    name: string;
    type: string;
    balance: number;
  };
}

export default function EditWalletModal({ wallet }: EditWalletModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  async function clientAction(formData: FormData) {
    const result = await updateWallet(formData);
    if (result?.success) {
      setIsOpen(false);
    } else {
      alert(result?.message);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-lg"
        title="Edit Wallet"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all text-slate-900 overflow-y-auto py-12">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Edit Wallet</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form action={clientAction} className="space-y-4">
              <input type="hidden" name="id" value={wallet.id} />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Wallet Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  defaultValue={wallet.name}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select 
                  name="type" 
                  defaultValue={wallet.type}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all bg-white"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Account</option>
                  <option value="ewallet">E-Wallet</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Balance (Immutable)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-slate-400">Rp</span>
                  <input 
                    type="text" 
                    disabled 
                    value={new Intl.NumberFormat('id-ID').format(wallet.balance)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic">*To change balance, please add a transaction.</p>
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
