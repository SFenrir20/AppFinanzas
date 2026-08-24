export type UserProfile = {
  currency: string;
  monthly_salary: string;
};

export type User = {
  id: number;
  email: string;
  profile: UserProfile;
};

export type BankAccount = {
  id: number;
  name: string;
  currency: string;
  balance: string;
  created_at: string;
};

export type CreditCard = {
  id: number;
  name: string;
  currency: string;
  credit_limit: string;
  current_balance: string;
  billing_day: number;
  created_at: string;
};

export type ExpenseSource = "account" | "card";

export type Expense = {
  id: number;
  description: string;
  amount: string;
  category: string;
  source: ExpenseSource;
  bank_account_id: number | null;
  credit_card_id: number | null;
  spent_at: string;
  created_at: string;
};

export type CardPayment = {
  id: number;
  bank_account_id: number;
  credit_card_id: number;
  amount: string;
  paid_at: string;
  created_at: string;
};

export type FinancialSummary = {
  total_bank_balance: string;
  monthly_expense: string;
  credit_used: string;
  credit_available: string;
  categories: Array<{ category: string; amount: string }>;
};
