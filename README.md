# Daviplata - Billetera Digital

Aplicacion financiera movil construida con React Native (bundles multiples), Node.js (backend hexagonal), PostgreSQL (Supabase) y contenedor Android Kotlin.

## Arquitectura

### React Native - Bundles Multiples
Un solo proyecto React Native genera 4 bundles JS independientes:
- **LoginBundle** - Pantalla de inicio de sesion
- **HomeBundle** - Panel principal con saldo y acciones
- **TransferBundle** - Formulario de transferencias
- **MovementsBundle** - Historial de transacciones

Cada bundle se carga via `ReactRootView` en el contenedor Android.

### Backend - Arquitectura Hexagonal
```
src/
  core/
    domain/     - Entidades, value objects, excepciones
    ports/      - Interfaces (inbound/outbound)
    services/   - Logica de negocio
  adapters/
    inbound/    - Controladores HTTP, middleware
    outbound/  - Repositorios PostgreSQL
    config/     - DI, createApp
```

### Base de Datos
- PostgreSQL via Supabase
- Tablas: users, accounts, transactions, sessions
- Indices optimizados para consultas frecuentes

### Android Kotlin
- Contenedor que carga bundles React Native
- Sesion encriptada con EncryptedSharedPreferences
- Deteccion de root y seguridad
- Navegacion entre bundles via eventos

## Configuracion

### Requisitos
- Node.js 18+
- Java 17 (JDK)
- Android Studio
- Supabase account
- Vercel account

### 1. Base de datos
1. Crear proyecto en Supabase
2. Ejecutar `database/001_schema.sql`
3. Ejecutar `database/002_seed.sql`

### 2. Backend
```bash
cd backend
cp ../.env.example ../.env
# Editar .env con tus credenciales
npm install
npm run dev
```

### 3. React Native
```bash
cd reactnative
npm install
npm run build:bundles
```

### 4. Android
Abrir `android/` en Android Studio, sincronizar Gradle y ejecutar.

### 5. Desplegar Backend
```bash
vercel deploy
```

## Endpoints API

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| POST | /api/auth/login | No | Iniciar sesion |
| POST | /api/auth/register | No | Registrar usuario |
| POST | /api/auth/logout | Si | Cerrar sesion |
| GET | /api/accounts/balance | Si | Obtener saldo |
| GET | /api/accounts/me | Si | Datos de cuenta |
| POST | /api/transactions/transfer | Si | Realizar transferencia |
| GET | /api/transactions/movements | Si | Historial de movimientos |

## Datos de Prueba

| Usuario | Correo | Contrasena | Saldo |
|---------|--------|------------|-------|
| Juan Perez | juan@correo.com | 123456 | $500,000 COP |
| Maria Garcia | maria@correo.com | 123456 | $300,000 COP |

## Estructura del Proyecto

```
daviplata/
├── reactnative/          # Proyecto React Native (4 bundles)
├── backend/              # Node.js + Express (hexagonal)
├── database/             # SQL schema y seeds
├── android/              # Contenedor Kotlin
├── vercel.json           # Configuracion de despliegue
├── .env.example          # Variables de entorno
└── README.md
```

## Tecnologias

- **Frontend:** React Native 0.74, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Base de datos:** PostgreSQL (Supabase)
- **Android:** Kotlin, AndroidX Security Crypto
- **Despliegue:** Vercel (backend), Supabase (DB)
- **Seguridad:** JWT, bcrypt, AES-256-GCM, root detection
