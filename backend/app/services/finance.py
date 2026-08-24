from datetime import date
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import extract, func, select
from sqlalchemy.orm import Session

from app.models.finance import BankAccount, CardPayment, CreditCard, Expense, ExpenseSource
from app.schemas.finance import CardPaymentCreate, CategorySummary, ExpenseCreate, FinancialSummary


def get_owned_account(db: Session, user_id: int, account_id: int) -> BankAccount:
    account = db.get(BankAccount, account_id)
    if account is None or account.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bank account not found")
    return account


def get_owned_card(db: Session, user_id: int, card_id: int) -> CreditCard:
    card = db.get(CreditCard, card_id)
    if card is None or card.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit card not found")
    return card


def create_expense(db: Session, user_id: int, payload: ExpenseCreate) -> Expense:
    try:
        expense = Expense(
            user_id=user_id,
            description=payload.description,
            amount=payload.amount,
            category=payload.category,
            source=payload.source.value,
            bank_account_id=payload.bank_account_id,
            credit_card_id=payload.credit_card_id,
            spent_at=payload.spent_at,
        )
        if payload.source == ExpenseSource.ACCOUNT:
            account = get_owned_account(db, user_id, payload.bank_account_id or 0)
            account.balance -= payload.amount
            expense.credit_card_id = None
        else:
            card = get_owned_card(db, user_id, payload.credit_card_id or 0)
            if card.current_balance + payload.amount > card.credit_limit:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Expense exceeds card limit",
                )
            card.current_balance += payload.amount
            expense.bank_account_id = None

        db.add(expense)
        db.commit()
        db.refresh(expense)
        return expense
    except Exception:
        db.rollback()
        raise


def pay_credit_card(db: Session, user_id: int, payload: CardPaymentCreate) -> CardPayment:
    try:
        account = get_owned_account(db, user_id, payload.bank_account_id)
        card = get_owned_card(db, user_id, payload.credit_card_id)
        if account.balance < payload.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient account balance",
            )
        if payload.amount > card.current_balance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment exceeds current card balance",
            )

        account.balance -= payload.amount
        card.current_balance -= payload.amount
        payment = CardPayment(
            user_id=user_id,
            bank_account_id=account.id,
            credit_card_id=card.id,
            amount=payload.amount,
            paid_at=payload.paid_at,
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment
    except Exception:
        db.rollback()
        raise


def build_summary(db: Session, user_id: int, today: date | None = None) -> FinancialSummary:
    today = today or date.today()
    total_bank_balance = db.scalar(
        select(func.coalesce(func.sum(BankAccount.balance), Decimal("0.00"))).where(
            BankAccount.user_id == user_id
        )
    )
    monthly_expense = db.scalar(
        select(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).where(
            Expense.user_id == user_id,
            extract("year", Expense.spent_at) == today.year,
            extract("month", Expense.spent_at) == today.month,
        )
    )
    credit_used = db.scalar(
        select(func.coalesce(func.sum(CreditCard.current_balance), Decimal("0.00"))).where(
            CreditCard.user_id == user_id
        )
    )
    credit_limit = db.scalar(
        select(func.coalesce(func.sum(CreditCard.credit_limit), Decimal("0.00"))).where(
            CreditCard.user_id == user_id
        )
    )
    rows = db.execute(
        select(Expense.category, func.sum(Expense.amount))
        .where(
            Expense.user_id == user_id,
            extract("year", Expense.spent_at) == today.year,
            extract("month", Expense.spent_at) == today.month,
        )
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount).desc())
    ).all()
    return FinancialSummary(
        total_bank_balance=total_bank_balance or Decimal("0.00"),
        monthly_expense=monthly_expense or Decimal("0.00"),
        credit_used=credit_used or Decimal("0.00"),
        credit_available=(credit_limit or Decimal("0.00")) - (credit_used or Decimal("0.00")),
        categories=[CategorySummary(category=row[0], amount=row[1]) for row in rows],
    )
