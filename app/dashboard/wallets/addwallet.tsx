'use client'

import { useState } from 'react';
import { createWallet } from '@/app/api/wallet/actions'; // Import Server Action
import { useFormStatus } from 'react-dom';

// Komponen tombol submit dengan loading state
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
      {pending ? 'Saving...' : 'Create Wallet'}
    </button>
  );
}

export default function addwallet() {
  const [isOpen, setIsOpen] = useState(false);

  // Wrapper untuk handle submit dan tutup modal setelah sukses
  async function clientAction(formData: FormData) {
    const result = await createWallet(formData);
    if (result?.success) {
      setIsOpen(false);
      // Opsional: Tampilkan toast notification sukses disini
    } else {
      alert(result?.message); // Ganti dengan toast error yang lebih cantik
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
      >
        + Add Wallet
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all overflow-y-auto py-12">
          
          {/* Modal Content */}
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Add New Wallet</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form action={clientAction} className="space-y-4">
              {/* Wallet Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Wallet Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  placeholder="e.g. Main Savings"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>

              {/* Wallet Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select 
                  name="type" 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all bg-white"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Account</option>
                  <option value="ewallet">E-Wallet</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Initial Balance */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Initial Balance</label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-slate-400">Rp</span>
                  <input 
                    type="number" 
                    name="balance" 
                    defaultValue="0"
                    min="0"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}