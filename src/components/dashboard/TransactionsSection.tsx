import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Trash2,
  Edit2
} from 'lucide-react';
import { Transaction, Account } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface TransactionsSectionProps {
  transactions: Transaction[];
  accounts: Account[];
  currencySymbol: string;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: number) => void;
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  transactions,
  accounts,
  currencySymbol,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const accountMap = useMemo(() => {
    return new Map(accounts.map((a) => [a.id, a]));
  }, [accounts]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (selectedType !== 'all' && tx.type !== selectedType) return false;

      // Account filter
      if (selectedAccount !== 'all' && String(tx.accountId) !== selectedAccount) return false;

      // Search term
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchesPayee = tx.payee.toLowerCase().includes(q);
        const matchesCat = tx.category.toLowerCase().includes(q);
        const matchesNotes = tx.notes?.toLowerCase().includes(q);
        const matchesTags = tx.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesPayee && !matchesCat && !matchesNotes && !matchesTags) return false;
      }

      return true;
    });
  }, [transactions, selectedType, selectedAccount, searchTerm]);

  // Sort by date descending
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filtered]);

  const paginated = useMemo(() => {
    return sorted.slice(0, page * pageSize);
  }, [sorted, page, pageSize]);

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-base text-white tracking-tight">Recent Transactions</h3>
          <p className="text-xs text-slate-400">
            {filtered.length} {filtered.length === 1 ? 'record' : 'records'} found
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search payee, tag..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors w-40 sm:w-48"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-emerald-500/60"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
            <option value="transfer">Transfers</option>
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-emerald-500/60 max-w-[130px] truncate"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          No transactions match your search filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Payee / Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginated.map((tx) => {
                const account = accountMap.get(tx.accountId);
                const toAccount = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;
                const isExpense = tx.type === 'expense';
                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>

                    {/* Payee & Tags */}
                    <td className="py-3 px-3 font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isIncome
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : isExpense
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-teal-500/10 text-teal-400'
                          }`}
                        >
                          {isIncome && <ArrowDownLeft className="w-3.5 h-3.5" />}
                          {isExpense && <ArrowUpRight className="w-3.5 h-3.5" />}
                          {isTransfer && <ArrowLeftRight className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="truncate max-w-[180px] sm:max-w-xs">{tx.payee}</div>
                          {tx.notes && (
                            <div className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-xs">
                              {tx.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/60">
                        {tx.category}
                      </span>
                    </td>

                    {/* Account */}
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {account ? (
                        <span className="truncate max-w-[120px] inline-block font-medium">
                          {account.name}
                          {isTransfer && toAccount && (
                            <span className="text-teal-400 ml-1">→ {toAccount.name}</span>
                          )}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Amount */}
                    <td
                      className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap text-sm ${
                        isIncome
                          ? 'text-emerald-400'
                          : isExpense
                          ? 'text-rose-400'
                          : 'text-teal-300'
                      }`}
                    >
                      {isIncome ? '+' : isExpense ? '-' : ''}
                      {formatCurrency(tx.amount, currencySymbol)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => tx.id && onDeleteTransaction(tx.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Load More Pagination */}
      {paginated.length < sorted.length && (
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            Show More ({sorted.length - paginated.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
};
