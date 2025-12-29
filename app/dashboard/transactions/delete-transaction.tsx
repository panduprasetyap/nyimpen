'use client'

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { deleteTransaction } from '@/app/api/transaction/actions';

interface DeleteTransactionProps {
  id: string;
  description: string;
  amount: string;
}

export default function DeleteTransaction({ id, description, amount }: DeleteTransactionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    const result = await deleteTransaction(id);
    
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
        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
        title="Delete Transaction"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-300">
          
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Header / Icon Section */}
            <div className="bg-rose-50 p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-3xl flex items-center justify-center text-rose-600 mb-6 ring-8 ring-rose-50 transition-transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Transaction?</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-2">
                Removing <span className="font-semibold text-slate-900">"{description}"</span> ({amount}) will restore your wallet balance.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 animate-in slide-in-from-top-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <p className="text-xs font-bold leading-tight">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="p-8 flex gap-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-3.5 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-[1.8] px-4 py-3.5 rounded-2xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/20 transition-all flex items-center justify-center disabled:opacity-50 active:scale-95"
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
