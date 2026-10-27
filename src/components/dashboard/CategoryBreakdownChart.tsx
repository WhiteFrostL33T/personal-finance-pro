import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Transaction } from '../../types/finance';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface CategoryBreakdownChartProps {
  transactions: Transaction[];
  currencySymbol: string;
}

const CATEGORY_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#f43f5e', // Rose
  '#14b8a6', // Teal
  '#eab308', // Yellow
];

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  transactions,
  currencySymbol,
}) => {
  // Aggregate expenses by category
  const { categoryData, totalExpense } = useMemo(() => {
    const expenseMap = new Map<string, number>();
    let total = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        const cat = tx.category || 'Uncategorized';
        expenseMap.set(cat, (expenseMap.get(cat) || 0) + tx.amount);
        total += tx.amount;
      }
    });

    const sorted = Array.from(expenseMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    return { categoryData: sorted, totalExpense: total };
  }, [transactions]);

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base text-white tracking-tight">Spending by Category</h3>
          <p className="text-xs text-slate-400">Expense distribution</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Total Spent</span>
          <div className="font-bold text-sm text-rose-400">
            {formatCurrency(totalExpense, currencySymbol)}
          </div>
        </div>
      </div>

      {categoryData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm">
          No expense transactions recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Donut Chart */}
          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const pct = totalExpense > 0 ? (item.value / totalExpense) * 100 : 0;
                      return (
                        <div className="rounded-xl bg-slate-950/95 border border-slate-700/80 p-2.5 shadow-xl backdrop-blur-md text-xs">
                          <div className="font-medium text-slate-200">{item.name}</div>
                          <div className="flex items-center justify-between gap-3 text-slate-300 mt-1">
                            <span className="font-mono text-emerald-400">
                              {formatCurrency(item.value, currencySymbol)}
                            </span>
                            <span className="text-slate-400">({formatPercent(pct)})</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] text-slate-400 font-medium">Categories</span>
              <span className="text-base font-bold text-white">{categoryData.length}</span>
            </div>
          </div>

          {/* Top Category Legend List */}
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 text-xs">
            {categoryData.map((item) => {
              const pct = totalExpense > 0 ? (item.value / totalExpense) * 100 : 0;
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800/80 hover:bg-slate-800/70 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-300 truncate font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 font-mono">
                    <span className="text-slate-200 font-semibold">
                      {formatCurrency(item.value, currencySymbol, 0)}
                    </span>
                    <span className="text-slate-500 text-[11px] w-10 text-right">
                      {formatPercent(pct, 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
