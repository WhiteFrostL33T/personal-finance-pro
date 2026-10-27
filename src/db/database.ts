import Dexie, { type Table } from 'dexie';
import { Account, Transaction, Budget, Goal, Category, UserSettings } from '../types/finance';

export class PersonalFinanceDB extends Dexie {
  accounts!: Table<Account, number>;
  transactions!: Table<Transaction, number>;
  budgets!: Table<Budget, number>;
  goals!: Table<Goal, number>;
  categories!: Table<Category, number>;
  settings!: Table<UserSettings, number>;

  constructor() {
    super('PersonalFinanceProDB');
    this.version(1).stores({
      accounts: '++id, name, type, isArchived',
      transactions: '++id, accountId, type, category, date, payee',
      budgets: '++id, category, [year+month], year, month',
      goals: '++id, name, isCompleted, targetDate',
      categories: '++id, name, type',
      settings: '++id',
    });
  }
}

export const db = new PersonalFinanceDB();

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  // Expense Categories
  { name: 'Housing & Rent', type: 'expense', icon: 'Home', color: '#6366f1' },
  { name: 'Groceries & Food', type: 'expense', icon: 'ShoppingBag', color: '#10b981' },
  { name: 'Dining & Cafes', type: 'expense', icon: 'Coffee', color: '#f59e0b' },
  { name: 'Transportation', type: 'expense', icon: 'Car', color: '#06b6d4' },
  { name: 'Utilities & Bills', type: 'expense', icon: 'Zap', color: '#8b5cf6' },
  { name: 'Entertainment & Fun', type: 'expense', icon: 'Film', color: '#ec4899' },
  { name: 'Health & Wellness', type: 'expense', icon: 'HeartPulse', color: '#ef4444' },
  { name: 'Shopping & Tech', type: 'expense', icon: 'Laptop', color: '#3b82f6' },
  { name: 'Travel & Vacations', type: 'expense', icon: 'Plane', color: '#14b8a6' },
  { name: 'Subscriptions', type: 'expense', icon: 'CreditCard', color: '#a855f7' },
  // Income Categories
  { name: 'Salary & Wages', type: 'income', icon: 'Briefcase', color: '#10b981' },
  { name: 'Freelance & Side Gig', type: 'income', icon: 'Laptop', color: '#06b6d4' },
  { name: 'Investment Returns', type: 'income', icon: 'TrendingUp', color: '#8b5cf6' },
  { name: 'Gifts & Reimbursements', type: 'income', icon: 'Gift', color: '#f59e0b' },
];

export async function seedInitialData() {
  const accountCount = await db.accounts.count();
  if (accountCount > 0) return; // Already seeded

  // 1. Settings
  await db.settings.add({
    currencySymbol: '$',
    currencyCode: 'USD',
    theme: 'dark',
    monthlyIncomeTarget: 7500,
    monthlySavingsTarget: 2200,
  });

  // 2. Categories
  for (const cat of DEFAULT_CATEGORIES) {
    await db.categories.add({ ...cat, isDefault: true });
  }

  // 3. Accounts
  const checkingId = await db.accounts.add({
    name: 'Primary Checking',
    type: 'checking',
    balance: 4850.50,
    currency: 'USD',
    color: '#3b82f6',
    icon: 'Landmark',
    institution: 'Chase Bank',
    createdAt: new Date().toISOString(),
  });

  await db.accounts.add({
    name: 'High-Yield Savings (4.75%)',
    type: 'savings',
    balance: 24200.00,
    currency: 'USD',
    color: '#10b981',
    icon: 'PiggyBank',
    institution: 'Marcus / Goldman Sachs',
    createdAt: new Date().toISOString(),
  });

  await db.accounts.add({
    name: 'Vanguard Index ETF',
    type: 'investment',
    balance: 48900.00,
    currency: 'USD',
    color: '#8b5cf6',
    icon: 'TrendingUp',
    institution: 'Vanguard Brokerage',
    createdAt: new Date().toISOString(),
  });

  const creditId = await db.accounts.add({
    name: 'Sapphire Preferred',
    type: 'credit',
    balance: -840.25,
    currency: 'USD',
    color: '#ec4899',
    icon: 'CreditCard',
    institution: 'Chase Card',
    createdAt: new Date().toISOString(),
  });

  await db.accounts.add({
    name: 'Physical Cash',
    type: 'cash',
    balance: 350.00,
    currency: 'USD',
    color: '#f59e0b',
    icon: 'Wallet',
    institution: 'Wallet',
    createdAt: new Date().toISOString(),
  });

  // 4. Budgets for Current Month
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const budgets = [
    { category: 'Groceries & Food', monthlyLimit: 650, month: currentMonth, year: currentYear, color: '#10b981' },
    { category: 'Dining & Cafes', monthlyLimit: 400, month: currentMonth, year: currentYear, color: '#f59e0b' },
    { category: 'Housing & Rent', monthlyLimit: 1800, month: currentMonth, year: currentYear, color: '#6366f1' },
    { category: 'Entertainment & Fun', monthlyLimit: 300, month: currentMonth, year: currentYear, color: '#ec4899' },
    { category: 'Transportation', monthlyLimit: 250, month: currentMonth, year: currentYear, color: '#06b6d4' },
    { category: 'Shopping & Tech', monthlyLimit: 350, month: currentMonth, year: currentYear, color: '#3b82f6' },
    { category: 'Subscriptions', monthlyLimit: 120, month: currentMonth, year: currentYear, color: '#a855f7' },
  ];

  for (const b of budgets) {
    await db.budgets.add(b);
  }

  // 5. Savings Goals
  const goals: Omit<Goal, 'id'>[] = [
    {
      name: 'Emergency Fund (6 Months)',
      targetAmount: 30000,
      currentAmount: 24200,
      targetDate: '2027-04-01',
      color: '#10b981',
      icon: 'ShieldCheck',
      createdAt: new Date().toISOString(),
    },
    {
      name: 'Trip to Japan & Kyoto',
      targetAmount: 5000,
      currentAmount: 3850,
      targetDate: '2027-09-15',
      color: '#06b6d4',
      icon: 'Plane',
      createdAt: new Date().toISOString(),
    },
    {
      name: 'M4 MacBook Pro Studio',
      targetAmount: 2800,
      currentAmount: 2800,
      targetDate: '2026-12-01',
      color: '#8b5cf6',
      icon: 'Laptop',
      isCompleted: true,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const g of goals) {
    await db.goals.add(g);
  }

  // 6. Recent realistic transactions across the past 30 days
  const sampleTransactions: Omit<Transaction, 'id'>[] = [
    {
      accountId: checkingId,
      amount: 4250.00,
      type: 'income',
      category: 'Salary & Wages',
      payee: 'Tech Corp Direct Deposit',
      date: formatDateOffset(1),
      notes: 'Bi-weekly payroll',
      tags: ['salary', 'work'],
      createdAt: new Date().toISOString(),
    },
    {
      accountId: creditId,
      amount: 142.80,
      type: 'expense',
      category: 'Groceries & Food',
      payee: 'Whole Foods Market',
      date: formatDateOffset(2),
      notes: 'Weekly pantry & fresh produce',
      tags: ['groceries', 'organic'],
      createdAt: new Date().toISOString(),
    },
    {
      accountId: creditId,
      amount: 68.50,
      type: 'expense',
      category: 'Dining & Cafes',
      payee: 'Trattoria Bella Italian',
      date: formatDateOffset(3),
      notes: 'Dinner with friends',
      tags: ['food', 'social'],
      createdAt: new Date().toISOString(),
    },
    {
      accountId: checkingId,
      amount: 1750.00,
      type: 'expense',
      category: 'Housing & Rent',
      payee: 'Avalon Luxury Apartments',
      date: formatDateOffset(5),
      notes: 'Monthly rent lease payment',
      tags: ['fixed', 'rent'],
      createdAt: new Date().toISOString(),
    },
    {
      accountId: checkingId,
      amount: 850.00,
      type: 'income',
      category: 'Freelance & Side Gig',
      payee: 'Stripe Payout - UI Design',
      date: formatDateOffset(7),
      notes: 'Brand design project completion',
      tags: ['freelance', 'client'],
      createdAt: new Date().toISOString(),
    },
    {
      accountId: creditId,
      amount: 84.19,
      type: 'expense',
      category: 'Transportation',
      payee: 'Shell Energy Gas',
      date: formatDateOffset(9),
      notes: 'Full tank fill up',
      tags: ['car', 'gas'],
      createdAt: new Date().toISOString(),
    },
    {
      accountId: creditId,
      amount: 18.99,
      type: 'expense',
      category: 'Subscriptions',
      payee: 'Spotify & Netflix',
      date: formatDateOffset(11),
      notes: 'Monthly digital services',
      tags: ['media'],
      createdAt: new Date().toISOString(),
    },
    {
      accountId: creditId,
      amount: 219.00,
      type: 'expense',
      category: 'Shopping & Tech',
      payee: 'B&H Photo Video',
      date: formatDateOffset(14),
      notes: 'Mechanical Keyboard & Desk Mat',
      tags: ['setup', 'tech'],
      createdAt: new Date().toISOString(),
    },
    {
      accountId: checkingId,
      amount: 4250.00,
      type: 'income',
      category: 'Salary & Wages',
      payee: 'Tech Corp Direct Deposit',
      date: formatDateOffset(16),
      notes: 'Bi-weekly payroll',
      tags: ['salary'],
      createdAt: new Date().toISOString(),
    },
    {
      accountId: creditId,
      amount: 125.40,
      type: 'expense',
      category: 'Groceries & Food',
      payee: 'Trader Joe\'s',
      date: formatDateOffset(18),
      notes: 'Healthy snacks and essentials',
      tags: ['groceries'],
      createdAt: new Date().toISOString(),
    },
    {
      accountId: creditId,
      amount: 94.00,
      type: 'expense',
      category: 'Health & Wellness',
      payee: 'Equinox Gym / ClassPass',
      date: formatDateOffset(20),
      notes: 'Monthly fitness pass',
      tags: ['health', 'fitness'],
      createdAt: new Date().toISOString(),
    },
    {
      accountId: checkingId,
      amount: 550.00,
      type: 'income',
      category: 'Investment Returns',
      payee: 'Vanguard Dividend Payment',
      date: formatDateOffset(22),
      notes: 'Quarterly ETF distribution reinvested',
      tags: ['dividend', 'passive'],
      createdAt: new Date().toISOString(),
    },
    {
      accountId: creditId,
      amount: 45.00,
      type: 'expense',
      category: 'Entertainment & Fun',
      payee: 'Cinema IMAX Tickets',
      date: formatDateOffset(25),
      notes: 'Dune Part Two with popcorn',
      tags: ['movies'],
      createdAt: new Date().toISOString(),
    },
  ];

  for (const t of sampleTransactions) {
    await db.transactions.add(t);
  }
}

function formatDateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

// Backup & Export utilities
export async function exportDatabaseToJson(): Promise<string> {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    accounts: await db.accounts.toArray(),
    transactions: await db.transactions.toArray(),
    budgets: await db.budgets.toArray(),
    goals: await db.goals.toArray(),
    categories: await db.categories.toArray(),
    settings: await db.settings.toArray(),
  };
  return JSON.stringify(data, null, 2);
}

export async function importDatabaseFromJson(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.accounts || !data.transactions) {
      throw new Error('Invalid JSON structure: missing core tables');
    }

    await db.transaction('rw', [db.accounts, db.transactions, db.budgets, db.goals, db.categories, db.settings], async () => {
      await db.accounts.clear();
      await db.transactions.clear();
      await db.budgets.clear();
      await db.goals.clear();
      await db.categories.clear();
      await db.settings.clear();

      if (data.accounts?.length) await db.accounts.bulkAdd(data.accounts);
      if (data.transactions?.length) await db.transactions.bulkAdd(data.transactions);
      if (data.budgets?.length) await db.budgets.bulkAdd(data.budgets);
      if (data.goals?.length) await db.goals.bulkAdd(data.goals);
      if (data.categories?.length) await db.categories.bulkAdd(data.categories);
      if (data.settings?.length) await db.settings.bulkAdd(data.settings);
    });
    return true;
  } catch (err) {
    console.error('Import failed', err);
    throw err;
  }
}

export async function exportTransactionsToCsv(): Promise<string> {
  const txs = await db.transactions.toArray();
  const accounts = await db.accounts.toArray();
  const accountMap = new Map(accounts.map(a => [a.id, a.name]));

  const headers = ['ID', 'Date', 'Type', 'Category', 'Payee', 'Amount', 'Account', 'Notes', 'Tags'];
  const rows = txs.map(t => [
    t.id || '',
    t.date,
    t.type,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.payee || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    `"${(accountMap.get(t.accountId) || 'Unknown').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
    `"${(t.tags?.join('; ') || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export async function resetDatabase(reseed: boolean = false) {
  await db.transaction('rw', [db.accounts, db.transactions, db.budgets, db.goals, db.categories, db.settings], async () => {
    await db.accounts.clear();
    await db.transactions.clear();
    await db.budgets.clear();
    await db.goals.clear();
    await db.categories.clear();
    await db.settings.clear();
  });
  if (reseed) {
    await seedInitialData();
  }
}
