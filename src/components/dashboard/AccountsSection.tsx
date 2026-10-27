import React from 'react';
import { Plus, ArrowLeftRight, Landmark, CreditCard, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
import { Account } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

interface AccountsSectionProps {
  accounts: Account[];
  currencySymbol: string;
  onAddAccount: () => void;
  onTransfer: () => void;
  onEditAccount: (account: Account) => void;
}

export const AccountsSection: React.FC<AccountsSectionProps> = ({
  accounts,
  currencySymbol,
  onAddAccount,
  onTransfer,
  onEditAccount,
}) => {
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'savings':
        return <PiggyBank className="w-4 h-4" />;
      case 'credit':
        return <CreditCard className="w-4 h-4" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4" />;
      case 'cash':
        return <Wallet className="w-4 h-4" />;
      default:
        return <Landmark className="w-4 h-4" />;
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base text-white tracking-tight">Accounts & Balances</h3>
          <p className="text-xs text-slate-400">Cash, banks, credit, and portfolios</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onTransfer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 border border-slate-700/60 transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Transfer</span>
          </button>
          <button
            onClick={onAddAccount}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-400 border border-emerald-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {accounts.map((acc) => {
          const isNegative = acc.balance < 0;
          return (
            <div
              key={acc.id}
              onClick={() => onEditAccount(acc)}
              className="cursor-pointer group relative overflow-hidden rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 p-4 transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1 opacity-80"
                style={{ backgroundColor: acc.color || '#10b981' }}
              />

              <div className="flex items-center justify-between">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: `${acc.color || '#10b981'}25`, color: acc.color || '#10b981' }}
                >
                  {getAccountIcon(acc.type)}
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/60">
                  {acc.type}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-xs font-medium text-slate-300 truncate group-hover:text-white transition-colors">
                  {acc.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {acc.institution || 'Direct Account'}
                </div>
                <div
                  className={`mt-2 text-lg font-bold font-sans tracking-tight ${
                    isNegative ? 'text-rose-400' : 'text-slate-100'
                  }`}
                >
                  {formatCurrency(acc.balance, currencySymbol)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
