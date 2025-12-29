'use client'

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { deleteWallet } from '@/app/api/wallet/actions';

interface DeleteWalletButtonProps {
  walletId: string;
  walletName: string;
}

export default function DeleteWalletButton({ walletId, walletName }: DeleteWalletButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    const result = await deleteWallet(walletId);
    
    if (result.success) {
      setIsOpen(false);
    } else {
      setError(result.message);
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-white/70 hover:text-red-200 transition-colors bg-white/10 hover:bg-red-500/20 rounded-lg"
        title="Delete Wallet"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-300">
          
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Header / Icon Section */}
            <div className="bg-red-50 p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-4 ring-8 ring-red-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Wallet?</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-2">
                Are you sure you want to delete <span className="font-semibold text-slate-900">"{walletName}"</span>? This action cannot be undone.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 animate-in slide-in-from-top-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <p className="text-xs font-medium leading-tight">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="p-6 flex gap-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-[1.5] px-4 py-3 rounded-2xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all flex items-center justify-center disabled:opacity-50 active:scale-95"
              >
                {isDeleting ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
