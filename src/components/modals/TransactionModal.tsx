import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { Transaction, Account, Category } from '../../types/finance';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>, id?: number) => Promise<void>;
  editingTx?: Transaction | null;
  accounts: Account[];
  categories: Category[];
  currencySymbol: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTx,
  accounts,
  categories,
  currencySymbol,
}) => {
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<number>(accounts[0]?.id || 1);
  const [toAccountId, setToAccountId] = useState<number>(accounts[1]?.id || 2);
  const [category, setCategory] = useState<string>('');
  const [payee, setPayee] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTx) {
      setType(editingTx.type);
      setAmount(String(editingTx.amount));
      setAccountId(editingTx.accountId);
      if (editingTx.toAccountId) setToAccountId(editingTx.toAccountId);
      setCategory(editingTx.category);
      setPayee(editingTx.payee);
      setDate(editingTx.date);
      setNotes(editingTx.notes || '');
      setTags(editingTx.tags?.join(', ') || '');
    } else {
      setType('expense');
      setAmount('');
      if (accounts.length > 0) setAccountId(accounts[0].id!);
      if (accounts.length > 1) setToAccountId(accounts[1].id!);
      const expenseCats = categories.filter((c) => c.type === 'expense');
      setCategory(expenseCats[0]?.name || 'Groceries & Food');
      setPayee('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setTags('');
    }
  }, [editingTx, isOpen, accounts, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await onSave(
        {
          type,
          amount: numAmount,
          accountId,
          toAccountId: type === 'transfer' ? toAccountId : undefined,
          category: type === 'transfer' ? 'Transfer' : category,
          payee: payee.trim() || (type === 'transfer' ? 'Account Transfer' : 'Unspecified'),
          date,
          notes: notes.trim(),
          tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          createdAt: editingTx?.createdAt || new Date().toISOString(),
        },
        editingTx?.id
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {editingTx ? 'Edit Transaction' : 'Record Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 mt-4 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              const expCat = categories.find((c) => c.type === 'expense');
              if (expCat) setCategory(expCat.name);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              const incCat = categories.find((c) => c.type === 'income');
              if (incCat) setCategory(incCat.name);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Income
          </button>
          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'transfer'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Transfer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-lg">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xl font-bold focus:outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          {/* Payee / Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              {type === 'transfer' ? 'Transfer Note' : 'Payee / Merchant / Description'}
            </label>
            <input
              type="text"
              required
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              placeholder={type === 'transfer' ? 'Transfer description' : 'e.g. Grocery Store, Employer, Coffee shop'}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          {/* Accounts & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Account */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {type === 'transfer' ? 'From Account' : 'Account'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({currencySymbol}{acc.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* To Account (if transfer) or Category */}
            {type === 'transfer' ? (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">To Account</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
                >
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({currencySymbol}{acc.balance.toFixed(2)})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
                >
                  {filteredCategories.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="groceries, essential"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-95"
            >
              {isSubmitting ? 'Saving...' : editingTx ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
