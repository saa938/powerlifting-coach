# Liftly Mobile (Expo / React Native)

The native Android + iOS app for Liftly, living inside the Turborepo monorepo. It
consumes the existing Next.js app as its backend over a bearer-token `/api/v1/*`
JSON API, and shares types + pure logic via the `@liftly/*` workspace packages.

```
liftly-android/            (repo root = web app + workspace host)
├─ apps/mobile/            ← this app (Expo Router, NativeWind, Supabase, RevenueCat)
├─ packages/shared-types/  ← domain types, Zod schemas, API DTOs
├─ packages/shared-logic/  ← pure functions (calculations, readiness, velocity, programming)
└─ packages/api-client/    ← typed client for /api/v1/*
```

## 1. Prerequisites

- **Node 20+** and **npm 10+** (repo uses npm workspaces; `.npmrc` sets `legacy-peer-deps`).
- To run on Android locally: **Android Studio** + **JDK 17** (Android Studio bundles one).
  - *Or* skip the local toolchain entirely and use **EAS cloud builds** (see §5).
- To publish iOS from Windows: an **Apple Developer account** — no Mac required (EAS builds iOS in the cloud).

## 2. Install

From the **repo root**:

```bash
npm install
```

This links the workspace packages and installs the app's native modules.

## 3. Environment

Copy the example and fill it in (these EXPO_PUBLIC_* values ship in the bundle and are **not** secret):

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

| Var | Where to get it |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `EXPO_PUBLIC_API_BASE_URL` | Your deployed backend, e.g. `https://liftly.tech` (use your dev machine's LAN IP + `:3000` for local, e.g. `http://192.168.1.50:3000`) |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` / `_IOS_KEY` | RevenueCat → Project → API keys → **public** app-specific keys |

**Server-only secrets** (`DATABASE_URL`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `STRIPE_*`, `CV_SERVICE_URL`) stay on the backend — never add them here.

## 4. Run locally (Windows + Android Studio)

1. Install Android Studio → SDK Manager: install **Android SDK Platform 34/35**, **Build-Tools**, **Platform-Tools**, and a **system image** (Pixel 7, API 34).
2. Set env vars (PowerShell, once):
   ```powershell
   setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
   setx PATH "$env:PATH;$env:LOCALAPPDATA\Android\Sdk\platform-tools"
   ```
   Enable **Windows Hypervisor Platform** (Windows Features) for the emulator, or use a physical device with USB debugging.
3. Create an AVD (Device Manager → Create Device) and start it.
4. Build & run the dev client (this app uses native modules — Expo Go is **not** enough):
   ```bash
   cd apps/mobile
   npx expo run:android
   ```
   Subsequent JS changes hot-reload via Metro; you only re-run native when native deps change.

> No Android toolchain? Run `eas build -p android --profile development`, install the APK it produces, then `npx expo start --dev-client`.

## 5. Supabase / Google OAuth configuration (one-time)

- **Auth → URL Configuration → Redirect URLs**: add `liftly://auth-callback` (the app's deep-link scheme).
- **Auth → Providers → Google**: enable it; register a **Web** OAuth client (Google Cloud Console → Credentials) as the Supabase Google client, plus **Android** (needs the app's SHA-1 from `eas credentials`) and **iOS** clients.
- The app already sets `scheme: "liftly"` and uses PKCE — no code changes needed once the dashboard is configured.

## 6. Build & submit (EAS — works entirely from Windows)

Run these from `apps/mobile`, not the repo root — this is an npm-workspaces
monorepo, and `eas`/`expo` commands read whichever `package.json`/`app.json`
sit in the current directory. Running them from the root reads the *web app's*
package.json (no `main` field, no `app/` router dir), which makes Metro fall
back to the bare Expo entry point and fail to resolve `App`.

```bash
cd apps/mobile

npm i -g eas-cli
eas login
eas init                      # writes the real projectId into app.json (replace REPLACE_WITH_EAS_PROJECT_ID)

# Android
eas build   -p android --profile production      # → AAB (Play) — or --profile preview for an APK
eas submit  -p android --profile production       # needs a Google Play service-account JSON

# iOS (compiled in Expo's macOS cloud — no local Mac needed)
eas build   -p ios --profile production
eas submit  -p ios --profile production           # needs an App Store Connect API key
```

Store prerequisites: Google Play developer account ($25 once), Apple Developer Program ($99/yr),
app icons/splash, screenshots, a privacy policy URL (the backend serves `/privacy`), and the
Data Safety (Play) / App Privacy (Apple) declarations.

## 7. Verify

```bash
cd apps/mobile
npx tsc --noEmit     # type safety (currently clean)
npx expo-doctor      # project/config/dependency health
```

## 8. Status & known gaps

See [`docs/mobile-status.md`](../../docs/mobile-status.md) for exactly what is wired and
verified vs. what still needs backend reconciliation (form-check upload, chat send,
nutrition, coach/admin auth, RevenueCat entitlement webhook).
