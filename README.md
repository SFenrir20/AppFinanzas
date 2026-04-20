# AppFinanzas

Aplicacion web de finanzas personales con autenticacion y base de datos en Supabase.

## Que incluye

- Registro de ingresos y egresos por usuario
- Login y creacion de cuenta con email y contrasena
- Resumen total de ingresos, egresos y balance
- Historial con filtros
- Analisis de gastos por categoria
- Exportacion e importacion en JSON
- Migracion opcional de datos locales de la version anterior
- Base PWA para usarla desde el celular al publicarla

## Archivos clave

- `index.html`: interfaz principal
- `app.js`: logica de autenticacion, sincronizacion y UI
- `supabase-config.js`: aqui debes colocar tu `Project URL` y tu `anon key`
- `supabase/schema.sql`: SQL para crear la tabla `movimientos` con RLS

## Configuracion en Supabase

1. Crea un proyecto gratis en Supabase.
2. Ve a `SQL Editor` y ejecuta el contenido de `supabase/schema.sql`.
3. Ve a `Project Settings > Data API` y copia tu `Project URL`.
4. Copia tu `anon/public key`.
5. Reemplaza los placeholders en `supabase-config.js`.
6. En `Authentication > Providers`, deja habilitado `Email`.
7. Si usas confirmacion por correo, revisa tu email al crear la cuenta.

## Como abrirla

No abras `index.html` con doble clic si quieres probar autenticacion y service worker. Usa un servidor local.

Ejemplo con Node:

```powershell
npx serve .
```

Luego abre la URL que te muestre el navegador.

## iPhone

Cuando publiques esta web, podras iniciar sesion desde Safari en iPhone y ver los mismos datos que en tu laptop, porque ahora los movimientos viven en Supabase y no solo en el navegador local.
