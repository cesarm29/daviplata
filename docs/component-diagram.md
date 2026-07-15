# Daviplata - Diagrama de Componentes

```mermaid
graph TB
    subgraph "Android App (Kotlin + RN)"
        subgraph "React Native Bundles (Hermes HBC)"
            LB[LoginBundle<br/>LoginScreen.tsx]
            HB[HomeBundle<br/>HomeScreen.tsx]
            TB[TransferBundle<br/>TransferScreen.tsx]
            MB[MovementsBundle<br/>MovementsScreen.tsx]
        end

        subgraph "Bridge Layer"
            BR[bridge.ts<br/>NativeModules.DaviplataModule]
        end

        subgraph "Native Modules"
            DM["DaviplataModule.kt<br/>@ReactMethod methods"]
        end

        subgraph "Navigation"
            NM[NavigationManager.kt<br/>loadBundle / handleEvent]
        end

        subgraph "Security"
            SM[SessionManager.kt<br/>EncryptedSharedPreferences]
            CM[CryptoManager.kt<br/>Android Keystore AES-256-GCM]
            RD[RootDetector.kt<br/>9 root checks]
        end

        subgraph "Network"
            AC[ApiClient.kt<br/>OkHttp + Interceptors]
        end

        subgraph "UI (Android Native)"
            SA[SplashActivity<br/>Entry point]
        end
    end

    subgraph "Backend (Vercel - Node.js)"
        subgraph "Controllers"
            AuthC[AuthController<br/>/api/auth/login]
            AccC[AccountController<br/>/api/accounts/balance]
            TxC[TxController<br/>/api/transactions/*]
        end

        subgraph "Core Services"
            AS[AuthService]
            ACS[AccountService]
            TS[TxService]
        end

        subgraph "Ports"
            AuthP[AuthPort]
            AccP[AccountPort]
            TxP[TxPort]
        end

        subgraph "Adapters"
            PgUser[PgUserRepository]
            PgAcc[PgAccountRepository]
            PgTx[PgTransactionRepository]
            JWT[JwtProvider]
            BC[BcryptProvider]
        end
    end

    subgraph "Database"
        PG[(Neon PostgreSQL<br/>SSL required)]
    end

    %% Connections
    SA -->|"start"| NM
    SA -->|"checkSecurity"| RD
    NM -->|"loadBundle()"| LB
    NM -->|"loadBundle()"| HB
    NM -->|"loadBundle()"| TB
    NM -->|"loadBundle()"| MB
    NM -->|"initialProps<br/>(flat Bundle)"| HB
    NM -->|"initialProps<br/>(flat Bundle)"| TB
    NM -->|"initialProps<br/>(flat Bundle)"| MB

    LB -->|"bridge.sendEvent"| BR
    HB -->|"bridge.sendEvent"| BR
    TB -->|"bridge.sendEvent"| BR
    MB -->|"bridge.sendEvent"| BR

    BR -->|"NativeModules"| DM
    DM -->|"sendEvent(eventName, data)"| NM
    DM -->|"getBalance/performTransfer/<br/>getMovements"| AC
    DM -->|"getSession"| SM
    DM -->|"encryptData/decryptData"| CM

    NM -->|"saveSession / clearSession"| SM
    NM -->|"checkSecurity"| RD

    AC -->|"HTTPS"| AuthC
    AC -->|"HTTPS"| AccC
    AC -->|"HTTPS"| TxC

    AuthC --> AS
    AccC --> ACS
    TxC --> TS
    AS --> AuthP
    ACS --> AccP
    TS --> TxP

    AuthP --> PgUser
    AuthP --> JWT
    AuthP --> BC
    AccP --> PgAcc
    TxP --> PgTx

    PgUser --> PG
    PgAcc --> PG
    PgTx --> PG
```

## Tabla de Componentes

| Componente | Archivo | Responsabilidad |
|------------|---------|-----------------|
| LoginBundle | `entry-points/login.js` | Formulario de autenticación |
| HomeBundle | `entry-points/home.js` | Dashboard con saldo y acciones |
| TransferBundle | `entry-points/transfer.js` | Formulario de transferencia |
| MovementsBundle | `entry-points/movements.js` | Historial paginado |
| bridge.ts | `src/services/bridge.ts` | Wrapper de NativeModules.DaviplataModule |
| DaviplataModule | `bridge/DaviplataModule.kt` | 8 métodos @ReactMethod |
| NavigationManager | `navigation/NavigationManager.kt` | Carga bundles y maneja eventos |
| SessionManager | `session/SessionManager.kt` | Sesiones cifradas |
| CryptoManager | `security/CryptoManager.kt` | AES-256-GCM Android Keystore |
| RootDetector | `security/RootDetector.kt` | Detección de dispositivos rooteados |
| ApiClient | `network/ApiClient.kt` | Cliente HTTP OkHttp |
| AuthController | `backend/adapters/in/AuthController.ts` | Login/logout endpoints |
| AuthService | `backend/core/services/AuthService.ts` | Lógica de autenticación |
| PgUserRepository | `backend/adapters/out/PgUserRepository.ts` | Persistencia PostgreSQL |
