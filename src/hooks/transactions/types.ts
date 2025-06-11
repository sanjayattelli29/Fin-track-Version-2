
export interface Account {
  id: string;
  name: string;
  isActive: boolean;
  accountNumber: number; // Make this required instead of optional
}

export interface Transaction {
  id: string;
  date: string;
  investment: number;
  earnings: number;
  spending: number;
  toBeCredit: number;
  salary?: number;
  debt?: number;
  interestRate?: number;
  salaryEntries?: SalaryEntry[];
  account_id?: string;
}

export interface CalendarTransaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense' | 'salary' | 'toBeCredit' | 'debt' | 'interest';
}

export interface SalaryEntry {
  id?: string;
  name: string;
  purpose: string; // Make this required to match SummaryCards expectations
  amount: number;
  date: string;
}

export interface DebtEntry {
  amount: number;
  interestRate: number;
  date: string; // Add missing date property
}

export interface SummaryData {
  remaining: number;
  income: number;
  expenses: number;
  toBeCredit: number;
  salary: number;
  debt?: number;
  interest?: number;
  showDebt?: boolean;
  salaryEntries?: SalaryEntry[];
}
