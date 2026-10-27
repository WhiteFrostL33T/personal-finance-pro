import React from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface StatCardsProps {
  netWorth: number;
  totalAssets: number;
  totalDebts: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currencySymbol: string;
}

export const StatCards: React.FC<StatCardsProps> = ({
  netWorth,
  totalAssets,
  totalDebts,
  monthlyIncome,
  monthlyExpenses,
  currencySymbol,
}) => {
  const savingsAmount = Math.max(0, monthlyIncome - monthlyExpenses);
  const savingsRate = monthlyIncome > 0 ? (savingsAmount / monthlyIncome) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Net Worth Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 p-5 shadow-lg group hover:border-slate-700 transition-all duration-300">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Total Net Worth
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            {formatCurrency(netWorth, currencySymbol)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 pt-2.5 border-t border-slate-800/80">
            <span>Assets: <strong className="text-emerald-400 font-semibold">{formatCurrency(totalAssets, currencySymbol, 0)}</strong></span>
            <span>Debt: <strong className="text-rose-400 font-semibold">{formatCurrency(totalDebts, currencySymbol, 0)}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Inflow (Income) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 p-5 shadow-lg group hover:border-slate-700 transition-all duration-300">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-teal-500/10 blur-xl pointer-events-none group-hover:bg-teal-500/20 transition-all" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Monthly Inflow
          </span>
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-teal-300 font-sans">
            {formatCurrency(monthlyIncome, currencySymbol)}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-teal-400/90 pt-2.5 border-t border-slate-800/80">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span>Active earnings this month</span>
          </div>
        </div>
      </div>

      {/* 3. Monthly Outflow (Expenses) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 p-5 shadow-lg group hover:border-slate-700 transition-all duration-300">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-rose-500/10 blur-xl pointer-events-none group-hover:bg-rose-500/20 transition-all" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Monthly Outflow
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-300 font-sans">
            {formatCurrency(monthlyExpenses, currencySymbol)}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-400/90 pt-2.5 border-t border-slate-800/80">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Total expenditures logged</span>
          </div>
        </div>
      </div>

      {/* 4. Savings Rate */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 p-5 shadow-lg group hover:border-slate-700 transition-all duration-300">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Savings Rate
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Percent className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-300 font-sans">
              {formatPercent(savingsRate)}
            </div>
            <span className="text-xs text-slate-400">
              (+{formatCurrency(savingsAmount, currencySymbol, 0)})
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-teal-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
