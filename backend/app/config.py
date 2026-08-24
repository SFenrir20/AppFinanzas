from functools import lru_cache

from pydantic import Field, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: PostgresDsn = Field(
        default="postgresql+psycopg://appfinanzas:appfinanzas@localhost:5432/appfinanzas"
    )
    jwt_secret_key: str = Field(default="change-this-development-secret", min_length=16)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    cors_origins: str = "http://localhost:8081,http://localhost:19006"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
