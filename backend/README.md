# Backend

FastAPI API for AppFinanzas. The mobile app talks only to this service; it never connects directly to PostgreSQL.

## Local setup

```powershell
cd C:\Users\santi\OneDrive\Desktop\Proyectos\AppFinanzas
docker compose up -d postgres
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
copy ..\.env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

Health check:

```powershell
curl http://localhost:8000/health
```

## Configuration

Use environment variables or a local `.env` file. Never commit real secrets.

- `DATABASE_URL`: SQLAlchemy database URL. Local development uses PostgreSQL from Docker Compose.
- `JWT_SECRET_KEY`: signing key for access tokens.
- `CORS_ORIGINS`: comma-separated origins allowed by the API.

## Tests

```powershell
python -m flake8 app tests
python -m pytest
```

The test suite uses SQLite in memory for speed, while development and future production use PostgreSQL.
