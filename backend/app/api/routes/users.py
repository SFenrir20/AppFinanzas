from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models import User
from app.schemas.auth import ProfileUpdate, UserRead

router = APIRouter(tags=["users"])


@router.get("/me", response_model=UserRead)
def read_me(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user


@router.patch("/me/profile", response_model=UserRead)
def update_profile(
    payload: ProfileUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    if payload.currency is not None:
        current_user.profile.currency = payload.currency.upper()
    if payload.monthly_salary is not None:
        current_user.profile.monthly_salary = payload.monthly_salary
    db.commit()
    db.refresh(current_user)
    return current_user
