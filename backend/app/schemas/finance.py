from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.finance import ExpenseSource


class BankAccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    currency: str = Field(default="PEN", min_length=3, max_length=3)
    balance: Decimal = Field(default=Decimal("0.00"), ge=0)


class BankAccountRead(BankAccountCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class CreditCardCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    currency: str = Field(default="PEN", min_length=3, max_length=3)
    credit_limit: Decimal = Field(gt=0)
    billing_day: int = Field(ge=1, le=31)


class CreditCardRead(CreditCardCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    current_balance: Decimal
    created_at: datetime


class ExpenseCreate(BaseModel):
    description: str = Field(min_length=1, max_length=240)
    amount: Decimal = Field(gt=0)
    category: str = Field(min_length=1, max_length=80)
    source: ExpenseSource
    bank_account_id: int | None = None
    credit_card_id: int | None = None
    spent_at: date = Field(default_factory=date.today)

    @model_validator(mode="after")
    def validate_source_reference(self) -> "ExpenseCreate":
        if self.source == ExpenseSource.ACCOUNT and self.bank_account_id is None:
            raise ValueError("bank_account_id is required for account expenses")
        if self.source == ExpenseSource.CARD and self.credit_card_id is None:
            raise ValueError("credit_card_id is required for card expenses")
        return self


class ExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    description: str
    amount: Decimal
    category: str
    source: ExpenseSource
    bank_account_id: int | None
    credit_card_id: int | None
    spent_at: date
    created_at: datetime


class CardPaymentCreate(BaseModel):
    bank_account_id: int
    credit_card_id: int
    amount: Decimal = Field(gt=0)
    paid_at: date = Field(default_factory=date.today)


class CardPaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    bank_account_id: int
    credit_card_id: int
    amount: Decimal
    paid_at: date
    created_at: datetime


class CategorySummary(BaseModel):
    category: str
    amount: Decimal


class FinancialSummary(BaseModel):
    total_bank_balance: Decimal
    monthly_expense: Decimal
    credit_used: Decimal
    credit_available: Decimal
    categories: list[CategorySummary]
