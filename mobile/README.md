# Mobile

Expo + React Native app for AppFinanzas.

## Design implementation

The app centralizes the Finza visual tokens in `src/design/tokens.ts`, including the approved palette:

- `#224248`
- `#325E6A`
- `#44A1A4`
- `#FF9A00`

Implemented screens:

- Splash and onboarding.
- Login and register.
- Authenticated tabs for home, movements, budget, goals and profile.
- New movement modal.
- Receipt scanner placeholder.

Home, movements and new expense creation use the existing API clients when the backend endpoint exists. Budget, goals, OAuth, biometrics, advanced profile/security settings and receipt scanning are local UI only or disabled because those backend services are not part of the current MVP.

## Local setup

```powershell
cd C:\Users\santi\OneDrive\Desktop\Proyectos\AppFinanzas\mobile
npm install
$env:EXPO_PUBLIC_API_URL="http://localhost:8000"
npm run start
```

Use Expo Go or a development build. On a physical phone, set `EXPO_PUBLIC_API_URL` to a LAN URL that can reach the FastAPI backend.

Android release previews that point to a local HTTP backend also need cleartext traffic enabled at build time:

```powershell
$env:EXPO_PUBLIC_API_URL="http://<LAN_IP>:8000"
$env:EXPO_ALLOW_CLEARTEXT="1"
npx expo prebuild --platform android
```

The local Expo config plugin writes `android:usesCleartextTraffic="true"` only when that variable is enabled.

Do not enable `EXPO_ALLOW_CLEARTEXT` for production builds. Production API URLs should use HTTPS.
