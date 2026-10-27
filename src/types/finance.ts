export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'cash';

export interface Account {
  id?: number;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  institution?: string;
  isArchived?: boolean;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id?: number;
  accountId: number;
  toAccountId?: number; // For transfers
  amount: number;
  type: TransactionType;
  category: string;
  payee: string;
  date: string; // ISO YYYY-MM-DD
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export interface Budget {
  id?: number;
  category: string;
  monthlyLimit: number;
  month: number; // 1-12
  year: number;
  color?: string;
}

export interface Goal {
  id?: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  color: string;
  icon: string;
  isCompleted?: boolean;
  createdAt: string;
}

export interface Category {
  id?: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface UserSettings {
  id?: number;
  currencySymbol: string;
  currencyCode: string;
  theme: 'dark' | 'light';
  monthlyIncomeTarget?: number;
  monthlySavingsTarget?: number;
}
