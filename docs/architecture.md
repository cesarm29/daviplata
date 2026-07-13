# Daviplata - Documento de Arquitectura

## 1. Visión General

Daviplata es una aplicación Android nativa que embebe 4 bundles de React Native compilados a Hermes bytecode, con un backend hexagonal desplegado en Vercel y base de datos Neon PostgreSQL.

## 2. Principios Arquitectónicos

- **Separación de responsabilidades**: RN para UI, Kotlin para puente nativo, Node.js para lógica de negocio
- **Comunicación bidireccional**: RN → Android vía NativeModules, Android → RN vía initial props
- **Seguridad por capas**: cifrado en reposo (Keystore), cifrado en tránsito (TLS + JWT), detección de root
- **Bundles independientes**: cada pantalla es un bundle Hermes separado, sin dependencia entre sí

## 3. Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTACIÓN (Android)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           React Native (Hermes HBC)                  │  │
│  │  ┌──────────┐ ┌──────┐ ┌──────────┐ ┌────────────┐ │  │
│  │  │  Login   │ │ Home │ │ Transfer │ │ Movements  │ │  │
│  │  │ bundle   │ │bundle│ │  bundle  │ │  bundle    │ │  │
│  │  └────┬─────┘ └──┬───┘ └────┬─────┘ └──────┬─────┘ │  │
│  │       └──────────┴──────────┴───────────────┘        │  │
│  │                     │ bridge.sendEvent()              │  │
│  └─────────────────────┼────────────────────────────────┘  │
│                        │                                    │
│  ┌─────────────────────┼────────────────────────────────┐  │
│  │           Android Kotlin (Native Layer)              │  │
│  │  ┌───────────────┐  │  ┌──────────────────────────┐ │  │
│  │  │DavplatModl    │◄─┘  │  NavigationManager       │ │  │
│  │  │(Native Module)│     │  - loadBundle()           │ │  │
│  │  │ - sendEvent   │     │  - handleEvent()          │ │  │
│  │  │ - getBalance  │     │  - ReactRootView mgmt    │ │  │
│  │  │ - performTx   │     └──────────────────────────┘ │  │
│  │  │ - encryptData │                                    │  │
│  │  └───────┬───────┘                                    │  │
│  │          │                                            │  │
│  │  ┌───────┴────────────────────────────────────────┐  │  │
│  │  │         Servicios Nativos                      │  │  │
│  │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ │  │  │
│  │  │  │SessionMgr  │ │CryptoMgr  │ │RootDetector│ │  │  │
│  │  │  │(Encrypted  │ │(Keystore  │ │(9 checks)  │ │  │  │
│  │  │  │ SharedPref)│ │ AES-256)  │ │            │ │  │  │
│  │  │  └────────────┘ └────────────┘ └────────────┘ │  │  │
│  │  │  ┌──────────────────────────────────────────┐  │  │  │
│  │  │  │          ApiClient (OkHttp)               │  │  │  │
│  │  │  │  Interceptors: Auth, Error, Logging       │  │  │  │
│  │  │  └───────────────────┬──────────────────────┘  │  │  │
│  │  └──────────────────────┼─────────────────────────┘  │  │
│  └─────────────────────────┼────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────┼────────────────────────────────┐
│              Backend (Vercel - Node.js)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             Express Router                            │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐   │  │
│  │  │  /auth/  │ │ /accounts│ │ /transactions/     │   │  │
│  │  │  login   │ │ /balance │ │ /transfer          │   │  │
│  │  │  logout  │ │          │ │ /movements         │   │  │
│  │  └────┬─────┘ └────┬─────┘ └─────────┬──────────┘   │  │
│  │       │            │                 │               │  │
│  │  ┌────┴────────────┴─────────────────┴──────────┐   │  │
│  │  │           Core Services                       │   │  │
│  │  │  AuthService | AccountService | TxService    │   │  │
│  │  └─────────────────────┬────────────────────────┘   │  │
│  │                        │                             │  │
│  │  ┌─────────────────────┴────────────────────────┐   │  │
│  │  │        Adaptadores de Salida                  │   │  │
│  │  │  PgUserRepo | PgAccountRepo | PgTxRepo       │   │  │
│  │  │  JwtProvider | BcryptProvider                │   │  │
│  │  └─────────────────────┬────────────────────────┘   │  │
│  └────────────────────────┼────────────────────────────┘  │
└───────────────────────────┼────────────────────────────────┘
                            │ TLS
                    ┌───────┴───────┐
                    │   Neon        │
                    │  PostgreSQL   │
                    │  (SSL req)    │
                    └───────────────┘
```

## 4. Flujo de Autenticación

1. Usuario ingresa credenciales en LoginScreen (RN)
2. LoginScreen llama `api.login(email, password)` → POST /api/auth/login
3. Backend valida bcrypt, genera JWT + sessionId, persiste sesión en DB
4. LoginScreen recibe `{ sessionId, token, user }`
5. LoginScreen llama `bridge.sendEvent('LOGIN_SUCCESS', {...})`
6. DaviplataModule.sendEvent convierte ReadableMap → Bundle
7. NavigationManager.handleEvent('LOGIN_SUCCESS', bundle):
   - Crea SessionData y guarda en SessionManager (EncryptedSharedPreferences)
   - Carga HomeBundle con props: `{ userId, name, phone, token }`
8. HomeScreen recibe props planas, llama `bridge.getBalance(token)` para saldo

## 5. Flujo de Transferencia

1. HomeScreen → `bridge.sendEvent('OPEN_TRANSFER', { token, userId, name, phone })`
2. NavigationManager carga TransferBundle con session data
3. TransferScreen recibe props: `{ userId, name, phone, token, balance }`
4. Usuario ingresa datos, llama `api.transfer(token, { destinationPhone, amount })`
5. Backend valida saldo, ejecuta transferencia, retorna transacción
6. TransferScreen → `bridge.sendEvent('TRANSFER_SUCCESS', { userId, name, phone, token })`
7. NavigationManager carga HomeBundle con session data actualizada

## 6. Esquema de Base de Datos

```sql
users: id, name, email, password_hash, phone, created_at, updated_at
accounts: id, user_id, account_number, balance, created_at, updated_at
transactions: id, type, amount, description, source_account_id,
              destination_phone, status, created_at
sessions: id, user_id, token, expires_at, created_at
```

## 7. Seguridad

| Capa | Medida |
|------|--------|
| Transporte | TLS 1.3, HSTS preload, Helmet headers |
| Autenticación | JWT + bcrypt (cost 12), sesiones en DB |
| Cifrado reposo | AES-256-GCM Android Keystore (CryptoManager) |
| Cifrado sesión | EncryptedSharedPreferences AES-256-GCM |
| Root detection | 9 checks: binaries, su, test-keys, emulator |
| API | Rate limit 100 req/15min, CORS restringido |
| DB | SSL `rejectUnauthorized: true` en producción |
| Android | `allowBackup=false`, ProGuard con reglas |
