# Base de datos Daviplata

## Configuracion

### Supabase
1. Crear un proyecto en [Supabase](https://supabase.com)
2. Ir al SQL Editor
3. Ejecutar `001_schema.sql` para crear las tablas
4. Ejecutar `002_seed.sql` para datos de prueba
5. Copiar la URL de conexion a `DATABASE_URL` en `.env`

### Credenciales de prueba
- **Usuario 1:** juan@correo.com / 123456 (saldo: $500,000 COP)
- **Usuario 2:** maria@correo.com / 123456 (saldo: $300,000 COP)

### Tablas
- `users` - Usuarios registrados
- `accounts` - Cuentas bancarias con saldo
- `transactions` - Historial de transacciones (DEBIT/CREDIT)
- `sessions` - Sesiones activas con JWT

### Indices
- `idx_transactions_user_id` - Busqueda rapida por usuario
- `idx_transactions_created_at` - Ordenamiento por fecha
- `idx_accounts_user_id` - Busqueda de cuenta por usuario
- `idx_sessions_session_id` - Busqueda de sesion
- `idx_sessions_token` - Validacion de token
