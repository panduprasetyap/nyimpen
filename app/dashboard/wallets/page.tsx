import AddWalletModal from './addwallet';
import EditWalletModal from './editwallet';
import DeleteWalletButton from './delete-button';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';


const formatCurrency = (amount: number | any) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};


const getCardStyle = (type: string) => {
  switch (type) {
    case 'bank':
      return 'bg-blue-600 text-white';
    case 'ewallet':
      return 'bg-sky-500 text-white';
    case 'cash':
      return 'bg-emerald-500 text-white';
    default:
      return 'bg-slate-800 text-white'; // Default color
  }
};


async function getWallets() {
  const session = await getSession();
  if (!session || !session.userId) redirect('/login');

  const wallets = await db.wallets.findMany({
    where: {
      user_id: BigInt(session.userId as string),
      is_active: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return wallets;
}

export default async function WalletsPage() {
  const wallets = await getWallets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Wallets</h1>
        <AddWalletModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {wallets.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500">Belum ada dompet. Tambahkan sekarang!</p>
          </div>
        )}

        {wallets.map((wallet) => (
          <div 
            key={wallet.id.toString()}
            className={`${getCardStyle(wallet.type)} p-6 rounded-2xl shadow-lg relative overflow-hidden group transition-transform hover:scale-[1.02]`}
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="font-medium opacity-90 text-lg">
                  {wallet.name}
                </span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded uppercase tracking-wider font-semibold">
                  {wallet.type}
                </span>

                {/* Actions: Edit & Delete */}
                <div className="flex gap-2">
                  <EditWalletModal wallet={{
                    id: wallet.id.toString(),
                    name: wallet.name,
                    type: wallet.type,
                    balance: Number(wallet.balance)
                  }} />
                  <DeleteWalletButton 
                    walletId={wallet.id.toString()} 
                    walletName={wallet.name} 
                  />
                </div>
              </div>
              
              <div>
                <p className="text-sm opacity-80 mb-1">Balance</p>
                <h3 className="text-2xl font-bold tracking-tight">
                  {formatCurrency(wallet.balance)}
                </h3>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}