# Gestor de tareas con dependencias

API del gestor de tareas y frontend en Vue. La API se conecta a PostgreSQL, aplica migraciones, expone un health check y permite registrar usuarios e iniciar sesión.

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

Edita `backend/.env` y reemplaza `TU_PASSWORD` por la contraseña del usuario `postgres`. Ese archivo no se sube a GitHub.

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

| Método | Ruta | Cuerpo |
|---|---|---|
| `POST` | `/auth/register` | `name`, `email`, `password` |
| `POST` | `/auth/login` | `email`, `password` |

- La contraseña necesita al menos 8 caracteres, una letra y un número. Se guarda como hash Argon2id, nunca en texto plano.
- El correo se guarda en minúsculas. Si ya está registrado, `/auth/register` responde `409`.
- Si el correo o la contraseña no coinciden, `/auth/login` responde `401`.
- Si falta un campo o tiene un formato inválido, la respuesta es `400` con la lista de errores.

Con la API corriendo, en otra terminal de PowerShell:

```powershell
$registro = @{ name = "Ana"; email = "ana@example.com"; password = "clave1234" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/register -ContentType "application/json" -Body $registro

$login = @{ email = "ana@example.com"; password = "clave1234" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/login -ContentType "application/json" -Body $login
```

## Frontend

En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173/.
