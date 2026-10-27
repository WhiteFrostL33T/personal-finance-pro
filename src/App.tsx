import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedInitialData } from './db/database';
import { Account, Transaction, Budget, Goal, UserSettings } from './types/finance';
import { Navbar } from './components/layout/Navbar';
import { StatCards } from './components/dashboard/StatCards';
import { CashFlowChart } from './components/dashboard/CashFlowChart';
import { CategoryBreakdownChart } from './components/dashboard/CategoryBreakdownChart';
import { AccountsSection } from './components/dashboard/AccountsSection';
import { BudgetsSection } from './components/dashboard/BudgetsSection';
import { GoalsSection } from './components/dashboard/GoalsSection';
import { TransactionsSection } from './components/dashboard/TransactionsSection';

// Modals
import { TransactionModal } from './components/modals/TransactionModal';
import { AccountModal } from './components/modals/AccountModal';
import { BudgetModal } from './components/modals/BudgetModal';
import { GoalModal } from './components/modals/GoalModal';
import { DataModal } from './components/modals/DataModal';
import { SettingsModal } from './components/modals/SettingsModal';

export const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isGoalDepositOnly, setIsGoalDepositOnly] = useState(false);

  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Live queries from Dexie
  const accounts = useLiveQuery(() => db.accounts.toArray()) ?? [];
  const transactions = useLiveQuery(() => db.transactions.toArray()) ?? [];
  const budgets = useLiveQuery(() => db.budgets.toArray()) ?? [];
  const goals = useLiveQuery(() => db.goals.toArray()) ?? [];
  const categories = useLiveQuery(() => db.categories.toArray()) ?? [];
  const settings = useLiveQuery(() => db.settings.toCollection().first());

  // Initialize DB on first load
  useEffect(() => {
    seedInitialData();
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    setIsDark((prev) => !prev);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const currencySymbol = settings?.currencySymbol || '$';

  // Financial calculations
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Current month transactions
  const currentMonthTxs = transactions.filter((t) => {
    const [y, m] = t.date.split('-').map(Number);
    return y === currentYear && m === currentMonth;
  });

  const monthlyIncome = currentMonthTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Assets and Debts
  const totalAssets = accounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalDebts = accounts
    .filter((a) => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const netWorth = totalAssets - totalDebts;

  // Handlers
  const handleSaveTransaction = async (txData: Omit<Transaction, 'id'>, id?: number) => {
    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      // If editing, revert old transaction's effect first
      if (id) {
        const oldTx = await db.transactions.get(id);
        if (oldTx) {
          const oldAccount = await db.accounts.get(oldTx.accountId);
          if (oldAccount) {
            if (oldTx.type === 'expense') {
              await db.accounts.update(oldAccount.id!, { balance: oldAccount.balance + oldTx.amount });
            } else if (oldTx.type === 'income') {
              await db.accounts.update(oldAccount.id!, { balance: oldAccount.balance - oldTx.amount });
            } else if (oldTx.type === 'transfer' && oldTx.toAccountId) {
              await db.accounts.update(oldAccount.id!, { balance: oldAccount.balance + oldTx.amount });
              const oldToAccount = await db.accounts.get(oldTx.toAccountId);
              if (oldToAccount) {
                await db.accounts.update(oldToAccount.id!, { balance: oldToAccount.balance - oldTx.amount });
              }
            }
          }
          await db.transactions.update(id, txData);
        }
      } else {
        await db.transactions.add(txData);
      }

      // Apply new transaction's effect on account balance
      const account = await db.accounts.get(txData.accountId);
      if (account) {
        if (txData.type === 'expense') {
          await db.accounts.update(account.id!, { balance: account.balance - txData.amount });
        } else if (txData.type === 'income') {
          await db.accounts.update(account.id!, { balance: account.balance + txData.amount });
        } else if (txData.type === 'transfer' && txData.toAccountId) {
          await db.accounts.update(account.id!, { balance: account.balance - txData.amount });
          const toAccount = await db.accounts.get(txData.toAccountId);
          if (toAccount) {
            await db.accounts.update(toAccount.id!, { balance: toAccount.balance + txData.amount });
          }
        }
      }
    });
  };

  const handleDeleteTransaction = async (id: number) => {
    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      const tx = await db.transactions.get(id);
      if (tx) {
        const account = await db.accounts.get(tx.accountId);
        if (account) {
          if (tx.type === 'expense') {
            await db.accounts.update(account.id!, { balance: account.balance + tx.amount });
          } else if (tx.type === 'income') {
            await db.accounts.update(account.id!, { balance: account.balance - tx.amount });
          } else if (tx.type === 'transfer' && tx.toAccountId) {
            await db.accounts.update(account.id!, { balance: account.balance + tx.amount });
            const toAccount = await db.accounts.get(tx.toAccountId);
            if (toAccount) {
              await db.accounts.update(toAccount.id!, { balance: toAccount.balance - tx.amount });
            }
          }
        }
        await db.transactions.delete(id);
      }
    });
  };

  const handleSaveAccount = async (accountData: Omit<Account, 'id'>, id?: number) => {
    if (id) {
      await db.accounts.update(id, accountData);
    } else {
      await db.accounts.add(accountData);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    await db.accounts.delete(id);
  };

  const handleSaveBudget = async (budgetData: Omit<Budget, 'id'>, id?: number) => {
    if (id) {
      await db.budgets.update(id, budgetData);
    } else {
      await db.budgets.add(budgetData);
    }
  };

  const handleDeleteBudget = async (id: number) => {
    await db.budgets.delete(id);
  };

  const handleSaveGoal = async (goalData: Omit<Goal, 'id'>, id?: number) => {
    if (id) {
      await db.goals.update(id, goalData);
    } else {
      await db.goals.add(goalData);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    await db.goals.delete(id);
  };

  const handleSaveSettings = async (newSettings: Partial<UserSettings>) => {
    if (settings?.id) {
      await db.settings.update(settings.id, newSettings);
    } else {
      await db.settings.add({
        currencySymbol: '$',
        currencyCode: 'USD',
        theme: 'dark',
        ...newSettings,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Sticky Header */}
      <Navbar
        onNewTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onResetDemo={() => setIsDataModalOpen(true)}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Stat Cards */}
        <StatCards
          netWorth={netWorth}
          totalAssets={totalAssets}
          totalDebts={totalDebts}
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
          currencySymbol={currencySymbol}
        />

        {/* Charts Section: Cash Flow & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CashFlowChart transactions={transactions} currencySymbol={currencySymbol} />
          <CategoryBreakdownChart transactions={currentMonthTxs} currencySymbol={currencySymbol} />
        </div>

        {/* Accounts & Balances */}
        <AccountsSection
          accounts={accounts}
          currencySymbol={currencySymbol}
          onAddAccount={() => {
            setEditingAccount(null);
            setIsAccountModalOpen(true);
          }}
          onTransfer={() => {
            setEditingTx(null);
            setIsTxModalOpen(true);
          }}
          onEditAccount={(acc) => {
            setEditingAccount(acc);
            setIsAccountModalOpen(true);
          }}
        />

        {/* Monthly Budgets & Savings Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetsSection
            budgets={budgets}
            transactions={transactions}
            currencySymbol={currencySymbol}
            onAddBudget={() => {
              setEditingBudget(null);
              setIsBudgetModalOpen(true);
            }}
            onEditBudget={(b) => {
              setEditingBudget(b);
              setIsBudgetModalOpen(true);
            }}
          />

          <GoalsSection
            goals={goals}
            currencySymbol={currencySymbol}
            onAddGoal={() => {
              setEditingGoal(null);
              setIsGoalDepositOnly(false);
              setIsGoalModalOpen(true);
            }}
            onContributeGoal={(g) => {
              setEditingGoal(g);
              setIsGoalDepositOnly(true);
              setIsGoalModalOpen(true);
            }}
            onEditGoal={(g) => {
              setEditingGoal(g);
              setIsGoalDepositOnly(false);
              setIsGoalModalOpen(true);
            }}
          />
        </div>

        {/* Transactions Feed & Filter Table */}
        <TransactionsSection
          transactions={transactions}
          accounts={accounts}
          currencySymbol={currencySymbol}
          onEditTransaction={(tx) => {
            setEditingTx(tx);
            setIsTxModalOpen(true);
          }}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>Personal Finance Pro — 100% Offline, Client-Side Encrypted Storage, Zero External Tracking.</p>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTx={editingTx}
        accounts={accounts}
        categories={categories}
        currencySymbol={currencySymbol}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
        editingAccount={editingAccount}
        currencySymbol={currencySymbol}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        onDelete={handleDeleteBudget}
        editingBudget={editingBudget}
        categories={categories}
        currencySymbol={currencySymbol}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
        editingGoal={editingGoal}
        isDepositOnly={isGoalDepositOnly}
        currencySymbol={currencySymbol}
      />

      <DataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onDataChanged={() => {}}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
};

export default App;
