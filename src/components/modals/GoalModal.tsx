import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Goal } from '../../types/finance';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id'>, id?: number) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  editingGoal?: Goal | null;
  isDepositOnly?: boolean;
  currencySymbol: string;
}

const GOAL_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingGoal,
  isDepositOnly = false,
  currencySymbol,
}) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('2000');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [depositAmount, setDepositAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-01-01');
  const [color, setColor] = useState('#10b981');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name);
      setTargetAmount(String(editingGoal.targetAmount));
      setCurrentAmount(String(editingGoal.currentAmount));
      setTargetDate(editingGoal.targetDate);
      setColor(editingGoal.color || '#10b981');
      setDepositAmount('');
    } else {
      setName('');
      setTargetAmount('2000');
      setCurrentAmount('0');
      setDepositAmount('');
      setTargetDate('2027-01-01');
      setColor('#10b981');
    }
  }, [editingGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isDepositOnly && editingGoal) {
        const added = parseFloat(depositAmount) || 0;
        const newTotal = editingGoal.currentAmount + added;
        await onSave(
          {
            ...editingGoal,
            currentAmount: newTotal,
            isCompleted: newTotal >= editingGoal.targetAmount,
          },
          editingGoal.id
        );
      } else {
        const target = parseFloat(targetAmount) || 0;
        const current = parseFloat(currentAmount) || 0;
        await onSave(
          {
            name: name.trim() || 'Savings Goal',
            targetAmount: target,
            currentAmount: current,
            targetDate,
            color,
            icon: 'Target',
            isCompleted: current >= target,
            createdAt: editingGoal?.createdAt || new Date().toISOString(),
          },
          editingGoal?.id
        );
      }
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
            {isDepositOnly ? `Contribute to ${editingGoal?.name}` : editingGoal ? 'Edit Goal' : 'Create Savings Goal'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {isDepositOnly ? (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Deposit Amount into Goal
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-base">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  autoFocus
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="50.00"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-lg font-bold focus:outline-none focus:border-emerald-500/60"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Current progress: {currencySymbol}{editingGoal?.currentAmount.toLocaleString()} / {currencySymbol}{editingGoal?.targetAmount.toLocaleString()}
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Emergency Fund, New Car, Vacation"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      step="10"
                      min="1"
                      required
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Current Saved</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Target Completion Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Accent Color</label>
                <div className="flex items-center gap-2">
                  {GOAL_COLORS.map((c) => (
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
            </>
          )}

          <div className="pt-3 flex items-center justify-between border-t border-slate-800">
            {editingGoal && onDelete && !isDepositOnly ? (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Delete this goal?')) {
                    await onDelete(editingGoal.id!);
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
                {isSubmitting ? 'Saving...' : isDepositOnly ? 'Add Deposit' : editingGoal ? 'Save Changes' : 'Create Goal'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
