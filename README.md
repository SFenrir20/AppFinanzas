# Finza

Finza es una aplicación móvil de finanzas personales pensada para ayudar a registrar movimientos, entender el balance del mes y tomar mejores decisiones sobre el dinero diario.

El proyecto nace como una evolución de una PWA anterior y ahora avanza hacia una app instalable para Android y iPhone, con backend propio y base de datos PostgreSQL. La app móvil no se conecta directamente a la base de datos: todas las operaciones pasan por la API de Finza.

## Qué hace

Finza permite centralizar información financiera personal en una experiencia móvil simple:

- Registro e inicio de sesión con autenticación propia.
- Perfil financiero básico con moneda y salario mensual.
- Resumen financiero con saldo total, gasto mensual, crédito usado/disponible y distribución por categoría.
- Cuentas bancarias y tarjetas de crédito.
- Listado de movimientos.
- Registro de gastos desde cuenta bancaria o tarjeta de crédito.
- Pagos de tarjeta desde una cuenta bancaria.
- Pantallas para presupuestos, metas, perfil, seguridad y escaneo de comprobantes.

## Estado del proyecto

Finza está en desarrollo activo. La base funcional del MVP ya existe, pero todavía hay módulos visuales que no tienen backend completo.

Actualmente consumen API real:

- Autenticación: registro e inicio de sesión.
- Perfil básico.
- Cuentas bancarias.
- Tarjetas de crédito.
- Gastos.
- Pagos de tarjeta.
- Resumen financiero.

Actualmente son UI local, flujo preparado o función pendiente:

- Ingresos y transferencias desde la pantalla de nuevo movimiento.
- Presupuestos.
- Metas.
- OAuth, biometría y seguridad avanzada.
- Escaneo de comprobantes. La interfaz existe, pero el OCR real todavía no está implementado.

Las operaciones financieras de varios pasos en el backend usan transacciones de base de datos y validan que cada recurso pertenezca al usuario autenticado.

## Arquitectura

- `mobile/`: app Expo con React Native y TypeScript.
- `backend/`: API FastAPI con Pydantic, SQLAlchemy, Alembic y Pytest.
- `legacy-web/`: PWA original conservada como referencia.
- `docs/`: notas de despliegue.
- `.github/workflows/`: validaciones de CI.
- `docker-compose.yml`: PostgreSQL local para desarrollo y demo.
- `render.yaml`: preparación para un futuro despliegue gratuito del backend en Render.

## Tecnologías

- Expo, React Native y TypeScript para la app móvil.
- FastAPI para la API propia.
- PostgreSQL como base de datos.
- SQLAlchemy y Alembic para modelos y migraciones.
- JWT y contraseñas hasheadas para autenticación.
- Docker Compose para levantar PostgreSQL en local.
- Pytest y flake8 para pruebas y lint del backend.
- GitHub Actions para validar backend y mobile.

## Desarrollo local

Requisitos recomendados:

- Git.
- Node.js y npm.
- Python 3.11 o superior.
- Docker Desktop.
- Expo Go o una development build para probar en el teléfono.

Configura variables desde los ejemplos incluidos. No se deben commitear `.env`, tokens ni credenciales reales.

### Backend

Desde la raíz del repo:

```powershell
docker compose up -d postgres
copy .env.example backend\.env
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload
```

Health check:

```powershell
curl http://localhost:8000/health
```

### App móvil

En otra terminal:

```powershell
cd mobile
npm install
$env:EXPO_PUBLIC_API_URL="http://localhost:8000"
npm run start
```

Para probar desde un teléfono físico en la misma red local, usa una URL LAN alcanzable por el celular:

```powershell
$env:EXPO_PUBLIC_API_URL="http://<LAN_IP>:8000"
npm run start
```

En builds Android locales que apunten a un backend HTTP de la red local, también se puede habilitar cleartext solo para esa build:

```powershell
$env:EXPO_PUBLIC_API_URL="http://<LAN_IP>:8000"
$env:EXPO_ALLOW_CLEARTEXT="1"
npx expo prebuild --platform android
```

No habilites `EXPO_ALLOW_CLEARTEXT` en producción. Las builds públicas deben usar HTTPS.

## Validaciones

Backend:

```powershell
cd backend
python -m flake8 app tests
python -m pytest
```

Mobile:

```powershell
cd mobile
npm run typecheck
```

## Despliegue futuro

El objetivo de costo para desarrollo y demo es cero:

- PostgreSQL local con Docker Compose durante desarrollo.
- Backend preparado para Render Free Web Service.
- Producción futura puede usar PostgreSQL gratuito de Supabase mediante `DATABASE_URL`.

Supabase se contempla solo como PostgreSQL administrado. Finza no usa Supabase Auth ni la API automática de Supabase. El backend FastAPI conserva la autenticación y las reglas de acceso.

Más detalles: `docs/deployment.md`.

## Hoja de ruta

- OCR real para escaneo de comprobantes.
- Backend completo para presupuestos y metas.
- Soporte real para ingresos y transferencias.
- Despliegue seguro con HTTPS.
- Pruebas móviles automatizadas y validación en dispositivos reales.
