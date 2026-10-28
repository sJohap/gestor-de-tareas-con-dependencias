# Gestor de tareas con dependencias

API del gestor de tareas y frontend en Vue. La API se conecta a PostgreSQL, aplica migraciones y maneja la sesión con dos tokens: uno de acceso, corto, y uno de refresco en una cookie HttpOnly.

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

`COOKIE_SECURE` se deja en `false` mientras la API corre en `http://localhost`. En un servidor con HTTPS debe quedar en `true`.

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
| `POST` | `/auth/refresh` | — | Cookie |
| `POST` | `/auth/logout` | — | Bearer y cookie |
| `GET` | `/auth/me` | — | Bearer |

- La contraseña necesita al menos 8 caracteres, una letra y un número. Se guarda como hash Argon2id, nunca en texto plano.
- El correo se guarda en minúsculas. Si ya está registrado, `/auth/register` responde `409`.
- Si el correo o la contraseña no coinciden, `/auth/login` responde `401`.
- Si falta un campo o tiene un formato inválido, la respuesta es `400` con la lista de errores.
- Registro e inicio de sesión responden con el usuario y un `accessToken` JWT. Ese token dura 15 minutos y se envía en `Authorization: Bearer ...`. El frontend lo guarda en memoria.
- Esas mismas respuestas dejan una cookie `refreshToken`: HttpOnly, SameSite Lax y con ruta `/auth`. Dura 7 días. En la base solo se guarda su hash, nunca el valor de la cookie.
- `POST /auth/refresh` lee esa cookie, la invalida y entrega otra junto con un access token nuevo. Si se reutiliza una cookie ya usada, se cierran todas las sesiones de ese usuario.
- `POST /auth/logout` solo revoca la cookie si pertenece al usuario del access token. Si no es suya, responde `403`.
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

En otra terminal, con la API ya corriendo:

```powershell
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173/. El registro y el inicio de sesión llaman a la API. Vite reenvía `/auth` a `http://localhost:3000`, así la cookie queda en el mismo sitio que la página.

Al recargar, si la cookie sigue vigente, la app pide un access token nuevo y muestra el nombre en la barra. Inicio y Acerca de exigen sesión: sin ella, la ruta vuelve a `/iniciar-sesion`. Si ya hay sesión, registro e inicio de sesión vuelven al inicio.

Si una petición responde `401` porque el access token venció, el cliente lo renueva una sola vez con la cookie y repite la petición. Un `401` de login o registro no se renueva: es una contraseña incorrecta.

## Tareas

Todas estas rutas piden `Authorization: Bearer ...`. Solo se ven y se modifican las tareas del usuario autenticado. Si la tarea es de otra persona, la respuesta es `403`.

| Método | Ruta | Cuerpo |
|---|---|---|
| `GET` | `/tasks` | — |
| `POST` | `/tasks` | `title`, `description` opcional |
| `PATCH` | `/tasks/:id` | `title`, `description`, `status` |
| `DELETE` | `/tasks/:id` | — |
| `POST` | `/tasks/:id/dependencies` | `dependsOnId` |
| `DELETE` | `/tasks/:id/dependencies/:dependsOnId` | — |

El estado puede ser `pending`, `in_progress` o `done`. Una tarea no puede depender de sí misma. El mismo enlace no se puede repetir. Detectar ciclos queda para después.

En el frontend, con la sesión iniciada, las tareas están en http://localhost:5173/tareas. Vite también reenvía `/tasks` a la API.
