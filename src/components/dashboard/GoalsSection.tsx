import React from 'react';
import { Plus, Target, CheckCircle2, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Goal } from '../../types/finance';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface GoalsSectionProps {
  goals: Goal[];
  currencySymbol: string;
  onAddGoal: () => void;
  onContributeGoal: (goal: Goal) => void;
  onEditGoal: (goal: Goal) => void;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  currencySymbol,
  onAddGoal,
  onContributeGoal,
  onEditGoal,
}) => {
  const triggerCelebration = (e: React.MouseEvent) => {
    e.stopPropagation();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
    });
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base text-white tracking-tight">Savings Goals</h3>
          <p className="text-xs text-slate-400">Target funds and milestones</p>
        </div>
        <button
          onClick={onAddGoal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-400 border border-emerald-500/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New Goal</span>
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
          No savings goals set yet. Dream big and start tracking towards your targets!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {goals.map((g) => {
            const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
            const isDone = g.isCompleted || g.currentAmount >= g.targetAmount;

            return (
              <div
                key={g.id}
                onClick={() => onEditGoal(g)}
                className="cursor-pointer group relative overflow-hidden rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 p-4 transition-all duration-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white"
                      style={{ backgroundColor: `${g.color || '#10b981'}30`, color: g.color || '#10b981' }}
                    >
                      <Target className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-xs text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                      {g.name}
                    </span>
                  </div>

                  {isDone ? (
                    <button
                      onClick={triggerCelebration}
                      className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1 hover:bg-emerald-500/30 transition-all"
                      title="Goal achieved! Click for confetti"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Reached! 🎉
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onContributeGoal(g);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 border border-slate-700/60 text-[11px] font-medium transition-colors"
                      title="Add contribution"
                    >
                      <DollarSign className="w-3 h-3 text-emerald-400" />
                      Deposit
                    </button>
                  )}
                </div>

                {/* Amount progress */}
                <div className="mt-3 flex items-baseline justify-between text-xs">
                  <span className="font-bold text-slate-100 font-sans text-sm">
                    {formatCurrency(g.currentAmount, currencySymbol, 0)}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    target {formatCurrency(g.targetAmount, currencySymbol, 0)} ({formatPercent(pct, 0)})
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${pct}%` }}
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
