from fastapi import APIRouter

from app.api.routes import auth, finance, health, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth")
api_router.include_router(finance.router)
api_router.include_router(health.router)
api_router.include_router(users.router, prefix="/users")
