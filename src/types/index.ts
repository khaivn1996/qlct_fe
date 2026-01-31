export interface User {
  id: string;
  email: string;
  avatar?: string;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  currency: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = "INCOME" | "EXPENSE";

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: TransactionType;
  icon: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  type: TransactionType;
  icon: string;
  note?: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  categoryId: string;
  category: Category;
  amount: string;
  type: TransactionType;
  txnDate: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDto {
  walletId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  txnDate: string;
  note?: string;
}

export interface ExpenseCategorySummary {
  categoryId: string;
  name: string;
  total: string;
  icon: string;
}

export interface MonthlyReport {
  totalIncome: string;
  totalExpense: string;
  balance: string;
  expenseByCategory: ExpenseCategorySummary[];
}
