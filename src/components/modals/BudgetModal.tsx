import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Budget, Category } from '../../types/finance';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id'>, id?: number) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  editingBudget?: Budget | null;
  categories: Category[];
  currencySymbol: string;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingBudget,
  categories,
  currencySymbol,
}) => {
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const [category, setCategory] = useState<string>(expenseCategories[0]?.name || 'Groceries & Food');
  const [monthlyLimit, setMonthlyLimit] = useState<string>('500');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingBudget) {
      setCategory(editingBudget.category);
      setMonthlyLimit(String(editingBudget.monthlyLimit));
    } else {
      if (expenseCategories.length > 0) setCategory(expenseCategories[0].name);
      setMonthlyLimit('500');
    }
  }, [editingBudget, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);
    if (isNaN(limit) || limit <= 0) return;

    const now = new Date();
    setIsSubmitting(true);
    try {
      await onSave(
        {
          category,
          monthlyLimit: limit,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
        editingBudget?.id
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {editingBudget ? 'Edit Budget Limit' : 'Set Category Budget'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Expense Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
            >
              {expenseCategories.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Monthly Spending Limit</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-base">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="10"
                min="1"
                required
                autoFocus
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-lg font-bold focus:outline-none focus:border-emerald-500/60"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              You will receive gentle alerts as you approach or cross this ceiling.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-800">
            {editingBudget && onDelete ? (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Delete this budget limit?')) {
                    await onDelete(editingBudget.id!);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
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
                {isSubmitting ? 'Saving...' : 'Set Budget'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
