from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    currency: str = Field(default="PEN", min_length=3, max_length=3)
    monthly_salary: Decimal = Field(default=Decimal("0.00"), ge=0)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProfileRead(BaseModel):
    currency: str
    monthly_salary: Decimal


class UserRead(BaseModel):
    id: int
    email: EmailStr
    profile: ProfileRead


class ProfileUpdate(BaseModel):
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    monthly_salary: Decimal | None = Field(default=None, ge=0)
