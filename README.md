# AppFinanzas

AppFinanzas se esta migrando desde una PWA estatica hacia una app movil instalable con backend propio.

## Arquitectura objetivo

- `mobile/`: app Expo con React Native y TypeScript.
- `backend/`: API FastAPI con SQLAlchemy, Alembic, Pydantic y Pytest.
- `legacy-web/`: PWA original conservada como referencia historica.
- `docker-compose.yml`: PostgreSQL local para desarrollo y demo.

La app movil no se conecta directamente a PostgreSQL ni a Supabase. Toda operacion financiera pasa por la API propia, que valida ownership por usuario y usa transacciones de base de datos para cambios multi-paso.

## Costo y despliegue

El entorno de desarrollo apunta a costo cero:

- PostgreSQL local con Docker Compose.
- App movil probada con Expo Go o development build.
- Backend preparado para Render Free Web Service.
- Produccion futura puede usar `DATABASE_URL` de un PostgreSQL gratuito de Supabase, sin usar Supabase Auth ni la API automatica.

No hay despliegue externo configurado desde este repositorio y no se incluyen credenciales reales.

## Desarrollo local

Las instrucciones completas se documentan junto a cada modulo:

- Backend: `backend/README.md`
- Mobile: `mobile/README.md`
- Web anterior: `legacy-web/README.md`

Inicio rapido:

```powershell
docker compose up -d postgres
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
copy ..\.env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

En otra terminal:

```powershell
cd mobile
npm install
$env:EXPO_PUBLIC_API_URL="http://localhost:8000"
npm run start
```

## Estado del MVP

El backend del MVP cubre registro e inicio de sesion, perfil financiero, cuentas bancarias, tarjetas de credito, gastos, pagos de tarjeta y resumen financiero. La app movil incluye shell de autenticacion y clientes API tipados; las pantallas financieras finales quedan pendientes del diseno Figma.

Las notificaciones, publicacion en tiendas, CloudFront y Firebase quedan fuera del alcance inicial.

## CI

GitHub Actions valida:

- Backend: instalacion, `flake8` y `pytest`.
- Mobile: `npm ci` y `npm run typecheck`.

## Despliegue futuro

Consulta `docs/deployment.md`. El repositorio incluye `render.yaml` para preparar Render, pero no se ha hecho deploy ni se han conectado cuentas externas.
