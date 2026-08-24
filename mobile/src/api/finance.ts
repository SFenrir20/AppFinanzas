import { apiRequest } from "./client";
import { BankAccount, CardPayment, CreditCard, Expense, FinancialSummary } from "./types";

export type CreateAccountInput = {
  name: string;
  currency: string;
  balance: string;
};

export type CreateCardInput = {
  name: string;
  currency: string;
  credit_limit: string;
  billing_day: number;
};

export type CreateExpenseInput = {
  description: string;
  amount: string;
  category: string;
  source: "account" | "card";
  bank_account_id?: number;
  credit_card_id?: number;
  spent_at?: string;
};

export type CreateCardPaymentInput = {
  bank_account_id: number;
  credit_card_id: number;
  amount: string;
  paid_at?: string;
};

export function listAccounts(token: string) {
  return apiRequest<BankAccount[]>("/accounts", { token });
}

export function createAccount(token: string, body: CreateAccountInput) {
  return apiRequest<BankAccount>("/accounts", { token, body });
}

export function listCards(token: string) {
  return apiRequest<CreditCard[]>("/cards", { token });
}

export function createCard(token: string, body: CreateCardInput) {
  return apiRequest<CreditCard>("/cards", { token, body });
}

export function listExpenses(token: string) {
  return apiRequest<Expense[]>("/expenses", { token });
}

export function createExpense(token: string, body: CreateExpenseInput) {
  return apiRequest<Expense>("/expenses", { token, body });
}

export function createCardPayment(token: string, body: CreateCardPaymentInput) {
  return apiRequest<CardPayment>("/card-payments", { token, body });
}

export function getSummary(token: string) {
  return apiRequest<FinancialSummary>("/summary", { token });
}
