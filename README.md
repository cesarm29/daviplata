# Daviplata - Billetera Digital

Aplicación de billetera digital con autenticación, transferencias y consulta de movimientos.

## Stack

| Componente | Tecnología |
|------------|-----------|
| **Frontend Android** | Kotlin + React Native 0.74 (Hermes HBC) |
| **Backend** | Node.js + Express + TypeScript (hexagonal) |
| **Base de datos** | Neon PostgreSQL |
| **Despliegue** | Vercel (backend), APK (Android) |
| **Seguridad** | AES-256-GCM (Android Keystore), EncryptedSharedPreferences, JWT + bcrypt |

## Arquitectura

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Daviplata App                                │
├──────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌────────────────────────────────────┐   │
│  │   Android (Kotlin)  │  │   React Native (4 Hermes Bundles)  │   │
│  │                     │  │                                    │   │
│  │  ┌───────────────┐  │  │  ┌────────┐ ┌────────┐           │   │
│  │  │ NavigationMgr │◄─┼──┼──┤ bridge │ │ Login  │           │   │
│  │  └───────────────┘  │  │  │ .send  │ │ Home   │           │   │
│  │  ┌───────────────┐  │  │  │ .get    │ │Transfer│           │   │
│  │  │ DaviplataMod  │◄─┼──┼──┤ .check  │ │Movements          │   │
│  │  │  (Native Mod) │  │  │  └────────┘ │        │           │   │
│  │  └───────────────┘  │  │             └────────┘           │   │
│  │  ┌───────────────┐  │  └────────────────────────────────────┘   │
│  │  │ SessionManager│  │                                            │
│  │  │ CryptoManager │  │  ┌──────────────────────────┐              │
│  │  │ RootDetector  │  │  │      Backend (Vercel)     │              │
│  │  │ ApiClient     │──┼──┼──► POST /auth/login       │              │
│  │  └───────────────┘  │  │  │ GET  /accounts/balance │              │
│  └─────────────────────┘  │  │ POST /transactions/trx  │              │
│                           │  │ GET  /transactions/mov  │              │
│                           │  │ GET  /health            │              │
│                           │  └──────────────────────────┘              │
└──────────────────────────────────────────────────────────────────────┘
```

## Bundles

4 entry points compilados a Hermes bytecode (~728KB c/u):

| Bundle | Componente Android | Props |
|--------|-------------------|-------|
| `login` | `LoginBundle` | `token`, `sessionId` |
| `home` | `HomeBundle` | `userId`, `name`, `phone`, `token` |
| `transfer` | `TransferBundle` | `userId`, `name`, `phone`, `token`, `balance` |
| `movements` | `MovementsBundle` | `userId`, `name`, `phone`, `token` |

## Build

```bash
# Bundles
cd reactnative
npm install
node build-bundles.js    # → assets/bundles/{login,home,transfer,movements}/*.bundle

# APK Debug
cd ../android
./gradlew assembleDebug   # → app/build/outputs/apk/debug/app-debug.apk

# APK Release
./gradlew assembleRelease # → app/build/outputs/apk/release/app-release.apk
```

## Comunicación Android ↔ RN

- **RN → Android**: `NativeModules.DaviplataModule.sendEvent(eventName, data)` vía `src/services/bridge.ts`
- **Android → RN**: `ReactRootView.startReactApplication()` con props planas en `Bundle`

## Seguridad

- JWT con bcrypt (cost 12), sesiones en DB, expiración 24h
- Cifrado AES-256-GCM vía Android Keystore (CryptoManager)
- Sesiones en EncryptedSharedPreferences (AES-256-GCM)
- Detección de root (9 mecanismos)
- `allowBackup="false"`, SSL verificación estricta en DB
- CORS restringido a `*.vercel.app`, HSTS con preload
- ProGuard con reglas específicas

## Backend (hexagonal)

```
src/
├── core/entities/       # User, Session, Account, Transaction
├── core/ports/          # AuthService, AccountService, TxService
├── adapters/in/         # Controladores Express (auth, accounts, transactions)
├── adapters/out/        # PostgreSQL, JWT, bcrypt
├── config/              # DI container, app setup
└── server.ts            # Entry point
```

API: `https://daviplata-app.vercel.app`

## Pruebas

Credenciales de prueba:
- `test@daviplata.com` / `Test1234!` — saldo $490,000 COP
- `maria@correo.com` / `Test1234!` — saldo $10,000 COP

```bash
# Health check
curl https://daviplata-app.vercel.app/api/health
# → {"status":"ok"}

# Login
curl -X POST https://daviplata-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@daviplata.com","password":"Test1234!"}'
```
