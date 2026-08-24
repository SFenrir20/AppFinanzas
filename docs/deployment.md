# Deployment Notes

No external deployment has been performed from this repository.

## Render backend

The `render.yaml` file prepares a future free Render Web Service for the FastAPI backend.

Required environment variables in Render:

- `DATABASE_URL`: PostgreSQL SQLAlchemy URL.
- `JWT_SECRET_KEY`: private signing key with at least 32 characters.
- `CORS_ORIGINS`: public origins allowed to call the API.

Render start command runs Alembic migrations before starting Uvicorn.

## Supabase as PostgreSQL only

For a future zero-cost demo, Supabase can provide the PostgreSQL database by copying its pooled or direct PostgreSQL connection string into `DATABASE_URL`.

Do not enable Supabase Auth for this app and do not point the mobile app at Supabase APIs. Authentication remains owned by the FastAPI backend.

## Mobile

Set `EXPO_PUBLIC_API_URL` before running Expo or creating a development build. For Expo Go on a physical device, use a LAN URL reachable from the phone.
