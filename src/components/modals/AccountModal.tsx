import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Account, AccountType } from '../../types/finance';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, 'id'>, id?: number) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  editingAccount?: Account | null;
  currencySymbol: string;
}

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingAccount,
  currencySymbol,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [balance, setBalance] = useState('');
  const [institution, setInstitution] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setType(editingAccount.type);
      setBalance(String(editingAccount.balance));
      setInstitution(editingAccount.institution || '');
      setColor(editingAccount.color || '#3b82f6');
    } else {
      setName('');
      setType('checking');
      setBalance('0');
      setInstitution('');
      setColor('#3b82f6');
    }
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(
        {
          name: name.trim(),
          type,
          balance: parseFloat(balance) || 0,
          currency: 'USD',
          color,
          icon: 'Landmark',
          institution: institution.trim() || undefined,
          createdAt: editingAccount?.createdAt || new Date().toISOString(),
        },
        editingAccount?.id
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {editingAccount ? 'Edit Account' : 'Add New Account'}
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
            <label className="block text-xs font-medium text-slate-400 mb-1">Account Name</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Primary Checking, Travel Savings"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Account Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit">Credit Card</option>
                <option value="investment">Investment</option>
                <option value="cash">Cash / Wallet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Current Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Institution / Bank Name</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Chase, Vanguard, Local Credit Union"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Accent Color</label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-110 border-white shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-800">
            {editingAccount && onDelete ? (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this account?')) {
                    await onDelete(editingAccount.id!);
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
                {isSubmitting ? 'Saving...' : editingAccount ? 'Save Changes' : 'Create Account'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
