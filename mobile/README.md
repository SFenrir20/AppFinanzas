# Mobile

Expo + React Native shell for AppFinanzas.

## Local setup

```powershell
cd C:\Users\santi\OneDrive\Desktop\Proyectos\AppFinanzas\mobile
npm install
$env:EXPO_PUBLIC_API_URL="http://localhost:8000"
npm run start
```

Use Expo Go or a development build. On a physical phone, set `EXPO_PUBLIC_API_URL` to a LAN URL that can reach the FastAPI backend.

The visual system is intentionally minimal until the Figma direction is available.
