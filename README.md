# Gestor de tareas con dependencias

API del gestor de tareas y frontend en Vue. La API se conecta a PostgreSQL, aplica migraciones, expone un health check y permite registrar usuarios, iniciar sesión y consultar el perfil con un token de acceso.

## Requisitos

- Node.js 22.18 o superior
- PostgreSQL 16 o superior

## Base de datos

Crea la base en PostgreSQL:

```sql
CREATE DATABASE gestor_tareas;
```

## Configuración

Dentro de `backend`:

```powershell
copy .env.example .env
```

Edita `backend/.env` y reemplaza `TU_PASSWORD` por la contraseña del usuario `postgres`. Cambia también `JWT_ACCESS_SECRET` por un valor largo y aleatorio. Ese archivo no se sube a GitHub.

## Arranque

```powershell
cd backend
npm install
npm run migrate
npm run dev
```

Prueba en el navegador:

- http://localhost:3000/
- http://localhost:3000/health

`/health` responde `"database": "up"` cuando PostgreSQL está conectado.

## Registro e inicio de sesión

| Método | Ruta | Cuerpo | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | `name`, `email`, `password` | No |
| `POST` | `/auth/login` | `email`, `password` | No |
| `GET` | `/auth/me` | — | Bearer |

- La contraseña necesita al menos 8 caracteres, una letra y un número. Se guarda como hash Argon2id, nunca en texto plano.
- El correo se guarda en minúsculas. Si ya está registrado, `/auth/register` responde `409`.
- Si el correo o la contraseña no coinciden, `/auth/login` responde `401`.
- Si falta un campo o tiene un formato inválido, la respuesta es `400` con la lista de errores.
- Registro e inicio de sesión responden con el usuario y un `accessToken` JWT. Ese token dura 15 minutos y se envía en `Authorization: Bearer ...`.
- `GET /auth/me` responde `401` si falta el token, está mal formado o ya expiró.

Con la API corriendo, en otra terminal de PowerShell:

```powershell
$registro = @{ name = "Ana"; email = "ana@example.com"; password = "clave1234" } | ConvertTo-Json
$cuenta = Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/register -ContentType "application/json" -Body $registro

$login = @{ email = "ana@example.com"; password = "clave1234" } | ConvertTo-Json
$sesion = Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/login -ContentType "application/json" -Body $login
$sesion.accessToken

Invoke-RestMethod -Uri http://localhost:3000/auth/me -Headers @{ Authorization = "Bearer $($sesion.accessToken)" }
```

## Frontend

En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173/.
