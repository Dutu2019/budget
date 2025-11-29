export interface Transaction {
  id: string;
  date: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  merchant: string;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface FinancialContext {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  topExpenseCategory: string;
  goals: Goal[];
  recentTransactions: Transaction[];
}

export type ToolRegistry = Record<string, (args: any) => any>;