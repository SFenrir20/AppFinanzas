create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  salary_amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  bank_name text not null,
  account_name text not null,
  balance numeric(12, 2) not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  bank_name text not null,
  card_name text not null,
  credit_limit numeric(12, 2) not null default 0,
  current_used numeric(12, 2) not null default 0,
  billing_day integer not null default 1 check (billing_day between 1 and 31),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  category text not null,
  description text,
  expense_date date not null,
  payment_method text not null check (payment_method in ('bank_account', 'credit_card')),
  source_label text not null,
  bank_account_id uuid references public.bank_accounts (id) on delete set null,
  credit_card_id uuid references public.credit_cards (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.card_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  bank_account_id uuid not null references public.bank_accounts (id) on delete cascade,
  credit_card_id uuid not null references public.credit_cards (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  payment_date date not null,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.credit_cards enable row level security;
alter table public.expenses enable row level security;
alter table public.card_payments enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "bank_accounts_select_own" on public.bank_accounts;
create policy "bank_accounts_select_own" on public.bank_accounts for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "bank_accounts_insert_own" on public.bank_accounts;
create policy "bank_accounts_insert_own" on public.bank_accounts for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "bank_accounts_update_own" on public.bank_accounts;
create policy "bank_accounts_update_own" on public.bank_accounts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "credit_cards_select_own" on public.credit_cards;
create policy "credit_cards_select_own" on public.credit_cards for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "credit_cards_insert_own" on public.credit_cards;
create policy "credit_cards_insert_own" on public.credit_cards for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "credit_cards_update_own" on public.credit_cards;
create policy "credit_cards_update_own" on public.credit_cards for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "expenses_select_own" on public.expenses;
create policy "expenses_select_own" on public.expenses for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "expenses_insert_own" on public.expenses;
create policy "expenses_insert_own" on public.expenses for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "expenses_delete_own" on public.expenses;
create policy "expenses_delete_own" on public.expenses for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "card_payments_select_own" on public.card_payments;
create policy "card_payments_select_own" on public.card_payments for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "card_payments_insert_own" on public.card_payments;
create policy "card_payments_insert_own" on public.card_payments for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "card_payments_delete_own" on public.card_payments;
create policy "card_payments_delete_own" on public.card_payments for delete to authenticated using ((select auth.uid()) = user_id);

