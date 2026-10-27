import React, { useMemo } from 'react';
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Budget, Transaction } from '../../types/finance';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface BudgetsSectionProps {
  budgets: Budget[];
  transactions: Transaction[];
  currencySymbol: string;
  onAddBudget: () => void;
  onEditBudget: (budget: Budget) => void;
}

export const BudgetsSection: React.FC<BudgetsSectionProps> = ({
  budgets,
  transactions,
  currencySymbol,
  onAddBudget,
  onEditBudget,
}) => {
  // Calculate spending for current month for each budget category
  const budgetProgress = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const currentMonthExpenses = transactions.filter((t) => {
      if (t.type !== 'expense') return false;
      const [y, m] = t.date.split('-').map(Number);
      return y === currentYear && m === currentMonth;
    });

    const spendingByCategory = new Map<string, number>();
    currentMonthExpenses.forEach((t) => {
      spendingByCategory.set(t.category, (spendingByCategory.get(t.category) || 0) + t.amount);
    });

    return budgets.map((b) => {
      const spent = spendingByCategory.get(b.category) || 0;
      const remaining = b.monthlyLimit - spent;
      const percentage = (spent / b.monthlyLimit) * 100;
      return {
        ...b,
        spent,
        remaining,
        percentage,
      };
    });
  }, [budgets, transactions]);

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base text-white tracking-tight">Category Budgets</h3>
          <p className="text-xs text-slate-400">Monthly limits and spending velocity</p>
        </div>
        <button
          onClick={onAddBudget}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-400 border border-emerald-500/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Set Budget</span>
        </button>
      </div>

      {budgetProgress.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
          No monthly budgets set yet. Click "Set Budget" to keep your expenses in check.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {budgetProgress.map((item) => {
            const isOver = item.spent > item.monthlyLimit;
            const isWarning = item.percentage >= 80 && !isOver;

            let barColor = 'bg-emerald-500';
            let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

            if (isOver) {
              barColor = 'bg-rose-500';
              badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            } else if (isWarning) {
              barColor = 'bg-amber-500';
              badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            }

            return (
              <div
                key={item.id}
                onClick={() => onEditBudget(item)}
                className="cursor-pointer group rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 p-4 transition-all duration-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                    {item.category}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badgeBg}`}
                  >
                    {isOver ? (
                      <>
                        <AlertCircle className="w-2.5 h-2.5" />
                        Over by {formatCurrency(Math.abs(item.remaining), currencySymbol, 0)}
                      </>
                    ) : isWarning ? (
                      <>
                        <AlertCircle className="w-2.5 h-2.5" />
                        {formatPercent(item.percentage, 0)}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {formatCurrency(item.remaining, currencySymbol, 0)} left
                      </>
                    )}
                  </span>
                </div>

                {/* Numbers */}
                <div className="mt-3 flex items-baseline justify-between text-xs">
                  <span className="font-bold text-slate-100 font-sans text-sm">
                    {formatCurrency(item.spent, currencySymbol)}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    limit {formatCurrency(item.monthlyLimit, currencySymbol, 0)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
