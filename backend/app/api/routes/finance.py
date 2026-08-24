from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models import BankAccount, CreditCard, Expense, User
from app.schemas.finance import (
    BankAccountCreate,
    BankAccountRead,
    CardPaymentCreate,
    CardPaymentRead,
    CreditCardCreate,
    CreditCardRead,
    ExpenseCreate,
    ExpenseRead,
    FinancialSummary,
)
from app.services.finance import build_summary, create_expense, pay_credit_card

router = APIRouter(tags=["finance"])


@router.post("/accounts", response_model=BankAccountRead, status_code=status.HTTP_201_CREATED)
def create_account(
    payload: BankAccountCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> BankAccount:
    account = BankAccount(
        user_id=current_user.id,
        name=payload.name,
        currency=payload.currency.upper(),
        balance=payload.balance,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.get("/accounts", response_model=list[BankAccountRead])
def list_accounts(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[BankAccount]:
    return list(db.scalars(select(BankAccount).where(BankAccount.user_id == current_user.id)))


@router.post("/cards", response_model=CreditCardRead, status_code=status.HTTP_201_CREATED)
def create_card(
    payload: CreditCardCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> CreditCard:
    card = CreditCard(
        user_id=current_user.id,
        name=payload.name,
        currency=payload.currency.upper(),
        credit_limit=payload.credit_limit,
        billing_day=payload.billing_day,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.get("/cards", response_model=list[CreditCardRead])
def list_cards(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[CreditCard]:
    return list(db.scalars(select(CreditCard).where(CreditCard.user_id == current_user.id)))


@router.post("/expenses", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED)
def add_expense(
    payload: ExpenseCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Expense:
    return create_expense(db, current_user.id, payload)


@router.get("/expenses", response_model=list[ExpenseRead])
def list_expenses(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[Expense]:
    return list(
        db.scalars(
            select(Expense)
            .where(Expense.user_id == current_user.id)
            .order_by(Expense.spent_at.desc(), Expense.id.desc())
        )
    )


@router.post(
    "/card-payments", response_model=CardPaymentRead, status_code=status.HTTP_201_CREATED
)
def create_card_payment(
    payload: CardPaymentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> CardPaymentRead:
    return pay_credit_card(db, current_user.id, payload)


@router.get("/summary", response_model=FinancialSummary)
def read_summary(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> FinancialSummary:
    return build_summary(db, current_user.id)
