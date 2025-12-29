import { getTransactions, getWalletsAndCategories } from '@/app/api/transaction/actions';
import AddTransactionModal from './addtransaction';
import TransactionList from './transaction-list';

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  const { wallets } = await getWalletsAndCategories();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transactions</h1>
          <p className="text-slate-500 text-sm mt-1">Keep track of your financial activities.</p>
        </div>
        <AddTransactionModal />
      </div>

      <TransactionList 
        initialTransactions={transactions} 
        wallets={wallets} 
      />
    </div>
  );
}
