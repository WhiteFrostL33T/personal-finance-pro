import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { UserSettings } from '../../types/finance';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: UserSettings;
  onSaveSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

const CURRENCY_OPTIONS = [
  { symbol: '$', code: 'USD', name: 'US Dollar ($)' },
  { symbol: '€', code: 'EUR', name: 'Euro (€)' },
  { symbol: '£', code: 'GBP', name: 'British Pound (£)' },
  { symbol: '¥', code: 'JPY', name: 'Japanese Yen (¥)' },
  { symbol: 'CA$', code: 'CAD', name: 'Canadian Dollar (CA$)' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar (A$)' },
  { symbol: 'CHF', code: 'CHF', name: 'Swiss Franc (CHF)' },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee (₹)' },
  { symbol: '₩', code: 'KRW', name: 'South Korean Won (₩)' },
  { symbol: 'R$', code: 'BRL', name: 'Brazilian Real (R$)' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState('$');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [incomeTarget, setIncomeTarget] = useState('7500');
  const [savingsTarget, setSavingsTarget] = useState('2200');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (settings) {
      setSelectedCurrency(settings.currencySymbol || '$');
      setCurrencyCode(settings.currencyCode || 'USD');
      setIncomeTarget(String(settings.monthlyIncomeTarget || 7500));
      setSavingsTarget(String(settings.monthlySavingsTarget || 2200));
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveSettings({
        currencySymbol: selectedCurrency,
        currencyCode: currencyCode,
        monthlyIncomeTarget: parseFloat(incomeTarget) || 0,
        monthlySavingsTarget: parseFloat(savingsTarget) || 0,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white tracking-tight">Preferences & Currency</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Currency</label>
            <select
              value={`${selectedCurrency}|${currencyCode}`}
              onChange={(e) => {
                const [sym, code] = e.target.value.split('|');
                setSelectedCurrency(sym);
                setCurrencyCode(code);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={`${c.symbol}|${c.code}`}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Target Monthly Income
              </label>
              <input
                type="number"
                step="100"
                value={incomeTarget}
                onChange={(e) => setIncomeTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Target Monthly Savings
              </label>
              <input
                type="number"
                step="100"
                value={savingsTarget}
                onChange={(e) => setSavingsTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
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
              {isSubmitting ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
