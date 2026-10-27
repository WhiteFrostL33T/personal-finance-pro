import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Transaction } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

interface CashFlowChartProps {
  transactions: Transaction[];
  currencySymbol: string;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
  transactions,
  currencySymbol,
}) => {
  const [range, setRange] = useState<'30days' | '6months'>('30days');

  // Compute daily / monthly aggregations
  const chartData = useMemo(() => {
    if (range === '30days') {
      // Last 30 days daily rollup
      const daysMap = new Map<string, { date: string; income: number; expense: number }>();
      const today = new Date();

      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        daysMap.set(key, { date: label, income: 0, expense: 0 });
      }

      transactions.forEach((tx) => {
        if (daysMap.has(tx.date)) {
          const entry = daysMap.get(tx.date)!;
          if (tx.type === 'income') entry.income += tx.amount;
          if (tx.type === 'expense') entry.expense += tx.amount;
        }
      });

      return Array.from(daysMap.values());
    } else {
      // Last 6 months rollup
      const monthMap = new Map<string, { date: string; income: number; expense: number }>();
      const today = new Date();

      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { month: 'short' });
        monthMap.set(key, { date: label, income: 0, expense: 0 });
      }

      transactions.forEach((tx) => {
        const key = tx.date.substring(0, 7);
        if (monthMap.has(key)) {
          const entry = monthMap.get(key)!;
          if (tx.type === 'income') entry.income += tx.amount;
          if (tx.type === 'expense') entry.expense += tx.amount;
        }
      });

      return Array.from(monthMap.values());
    }
  }, [transactions, range]);

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-base text-white tracking-tight">Cash Flow Trend</h3>
          <p className="text-xs text-slate-400">Income vs Expenses over time</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto">
          <button
            onClick={() => setRange('30days')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              range === '30days'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setRange('6months')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              range === '6months'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Last 6 Months
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const income = (payload.find((p) => p.dataKey === 'income')?.value as number) || 0;
                  const expense = (payload.find((p) => p.dataKey === 'expense')?.value as number) || 0;
                  const net = income - expense;

                  return (
                    <div className="rounded-xl bg-slate-950/95 border border-slate-700/80 p-3 shadow-xl backdrop-blur-md text-xs">
                      <div className="font-semibold text-slate-300 mb-2">{label}</div>
                      <div className="flex items-center justify-between gap-4 text-emerald-400">
                        <span>Income:</span>
                        <strong className="font-mono">{formatCurrency(income, currencySymbol)}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-rose-400 mt-1">
                        <span>Expenses:</span>
                        <strong className="font-mono">{formatCurrency(expense, currencySymbol)}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-indigo-300 mt-1.5 pt-1.5 border-t border-slate-800">
                        <span>Net Flow:</span>
                        <strong className="font-mono">
                          {net >= 0 ? '+' : ''}{formatCurrency(net, currencySymbol)}
                        </strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#incomeGradient)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#f43f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Income</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Expenses</span>
        </div>
      </div>
    </div>
  );
};
