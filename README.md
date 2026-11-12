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
| `GET` | `/tasks/plan` | — |
| `POST` | `/tasks` | `title`, `description` opcional, `durationDays` |
| `PATCH` | `/tasks/:id` | `title`, `description`, `status`, `durationDays` |
| `DELETE` | `/tasks/:id` | — |
| `POST` | `/tasks/:id/dependencies` | `dependsOnId` |
| `DELETE` | `/tasks/:id/dependencies/:dependsOnId` | — |

El estado puede ser `pending`, `in_progress` o `done`. Una tarea no puede depender de sí misma. El mismo enlace no se puede repetir. Si el enlace cierra un ciclo, `POST /tasks/:id/dependencies` responde `409`.

`GET /tasks/plan` arma el grafo dirigido y responde:

- `order`: el orden de ejecución, calculado con el algoritmo de Kahn. Una tarea aparece después de todas las de las que depende. Las del camino crítico van marcadas.
- `hasCycle`: `true` solo si el grafo todavía tiene un ciclo. En ese caso no hay camino crítico.
- `projectDays`: la duración mínima del proyecto, que es el camino más largo.
- `tasks`: cada tarea con `executionState`, `durationDays`, inicio más pronto, fin más tarde, `slack` y `critical`.

La holgura es cuántos días se puede atrasar una tarea sin mover el fin del proyecto. Si la holgura es 0, la tarea es crítica.

En el frontend, con la sesión iniciada, las tareas están en http://localhost:5173/tareas. Esa pantalla muestra el orden, la holgura y marca el camino crítico. Vite también reenvía `/tasks` a la API.

## Estructura

```text
backend/src
  routes          recibe la petición HTTP
  controllers     traduce la petición a una respuesta
  services        decide las reglas
  repositories    habla con PostgreSQL
  domain          grafo, Kahn, camino crítico y holgura
  middlewares     sesión, rol, límite de intentos y errores
  db/migrations   historial de la base

frontend/src
  layouts         marco de la app y marco de acceso
  views           pantallas
  stores          sesión en memoria
  router          guardias de las rutas
```

Cada petición queda escrita en la consola con el método, la ruta, el código y los milisegundos. Si la ruta no existe, la API responde `404`.

## Roles y límite de intentos

El registro crea cuentas con rol `user`. Un administrador se asigna en la base:

```sql
UPDATE users SET role = 'admin' WHERE email = 'tu-correo@example.com';
```

`GET /admin/users` solo responde a un `admin`. El resto recibe `403`.

`POST /auth/login` y `POST /auth/register` aceptan 8 intentos cada 15 minutos por dirección. El siguiente responde `429`.

## Pruebas

Dentro de `backend`:

```powershell
npm run test
```

Cubren el rechazo de ciclos, el orden de Kahn, el camino crítico, la holgura y si una tarea está lista o bloqueada.

## Despliegue

La API ya lee el puerto, la base, el secreto y el origen del frontend desde el entorno. En el servidor:

- `COOKIE_SECURE=true` si el sitio usa HTTPS
- `CLIENT_ORIGIN` con la dirección pública del frontend
- `DATABASE_URL` con la base de producción
- `JWT_ACCESS_SECRET` distinto del de tu PC

El frontend se construye con `npm run build` dentro de `frontend`. La carpeta `frontend/dist` es la página lista para publicar.

