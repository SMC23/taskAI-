# API

Base en desarrollo: `http://localhost:4000/api`. Los ejemplos usan valores ficticios.

Volver al [README](../README.md).

## Convenciones

**Autenticación.** Los endpoints marcados como privados exigen la cabecera `Authorization: Bearer <token>`. El token se obtiene en `register` o `login`. Los ejemplos asumen:

```bash
API=http://localhost:4000/api
TOKEN=token_de_ejemplo
PROJECT_ID=11111111-1111-4111-8111-111111111111
TASK_ID=22222222-2222-4222-8222-222222222222
```

**Formato de error.** Todos los errores tienen esta forma; `details` solo aparece con errores por campo:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [{ "field": "status", "message": "El estado debe ser uno de: pending, active, completed" }]
  }
}
```

**Errores comunes**

| HTTP | Código | Cuándo |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Cuerpo, parámetro o query inválidos |
| 400 | `INVALID_JSON` | El cuerpo no es JSON válido |
| 401 | `NO_TOKEN` | Falta la cabecera o no es `Bearer` |
| 401 | `INVALID_TOKEN` | Token mal formado, con firma incorrecta o de un usuario inexistente |
| 401 | `TOKEN_EXPIRED` | Token caducado |
| 404 | `NOT_FOUND` | La ruta no existe |
| 429 | `RATE_LIMITED` | Se superó un límite de uso |
| 500 | `DATABASE_ERROR` | Fallo de la base de datos |
| 500 | `INTERNAL_ERROR` | Error inesperado, incluido un cuerpo de más de 100 KB |

Con `NODE_ENV=production`, `INTERNAL_ERROR` responde siempre "Error interno del servidor".

**Límites de uso** (por IP, en memoria del proceso)

| Límite | Ventana | Máximo | Se aplica a |
|---|---|---|---|
| Global | 15 min | 100 | Toda la API. Configurable con `RATE_LIMIT_WINDOW_MS` y `RATE_LIMIT_MAX` |
| Autenticación | 15 min | 20 | `POST /auth/register` y `POST /auth/login` |
| IA | 1 hora | 10 | `POST /projects`, también si luego falla la validación del cuerpo |

Las respuestas incluyen las cabeceras `RateLimit` y `RateLimit-Policy`. Un 429 incluye además `Retry-After`, en segundos.

## Salud

### `GET /health`

Pública.

```bash
curl $API/health
```

`200`

```json
{ "status": "ok", "timestamp": "2026-01-15T10:00:00.000Z" }
```

## Autenticación

### `POST /auth/register`

Pública. Límite de autenticación.

| Campo | Regla |
|---|---|
| `name` | De 2 a 50 caracteres |
| `email` | Email válido; se guarda en minúsculas |
| `password` | De 8 a 72 caracteres, con mayúscula, minúscula y número |

```bash
curl -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana Ejemplo","email":"ana@example.com","password":"Password123"}'
```

`201`

```json
{
  "token": "token_de_ejemplo",
  "user": { "id": "33333333-3333-4333-8333-333333333333", "name": "Ana Ejemplo", "email": "ana@example.com" }
}
```

Errores: `400 VALIDATION_ERROR`, `409 EMAIL_IN_USE`, `429 RATE_LIMITED`.

### `POST /auth/login`

Pública. Límite de autenticación. Cuerpo: `email` y `password`.

```bash
curl -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@example.com","password":"Password123"}'
```

`200`: igual que el registro.

Errores: `400 VALIDATION_ERROR`, `429 RATE_LIMITED` y `401 INVALID_CREDENTIALS`, que es idéntico si el email no existe o si la contraseña es incorrecta.

### `GET /auth/me`

Privada.

```bash
curl $API/auth/me -H "Authorization: Bearer $TOKEN"
```

`200`

```json
{ "user": { "id": "33333333-3333-4333-8333-333333333333", "name": "Ana Ejemplo", "email": "ana@example.com" } }
```

Errores: `401`.

## Proyectos

Todos los endpoints son privados. Un proyecto inexistente o de otro usuario responde `404 PROJECT_NOT_FOUND`. Un `:id` que no sea UUID responde `400 VALIDATION_ERROR`.

### `POST /projects`

Crea el proyecto y genera sus tareas con IA. Suele tardar entre 5 y 30 segundos. Límite de IA.

| Campo | Regla |
|---|---|
| `title` | De 3 a 100 caracteres |
| `description` | De 20 a 2000 caracteres |

```bash
curl -X POST $API/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Lanzar tienda online","description":"Quiero vender cerámica por internet en dos meses y no tengo web."}'
```

`201`

```json
{
  "project": {
    "id": "11111111-1111-4111-8111-111111111111",
    "user_id": "33333333-3333-4333-8333-333333333333",
    "title": "Lanzar tienda online",
    "description": "Quiero vender cerámica por internet en dos meses y no tengo web.",
    "status": "pending",
    "created_at": "2026-01-15T10:00:00.000Z",
    "updated_at": "2026-01-15T10:00:00.000Z"
  },
  "tasks": [
    {
      "id": "22222222-2222-4222-8222-222222222222",
      "project_id": "11111111-1111-4111-8111-111111111111",
      "title": "Definir el catálogo inicial",
      "description": "Elegir los productos y fijar sus precios.",
      "priority": "high",
      "status": "todo",
      "order_index": 0,
      "created_at": "2026-01-15T10:00:00.000Z",
      "updated_at": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

La IA genera de 3 a 15 tareas. En todos los errores siguientes no se guarda nada en `projects` ni en `tasks`.

| HTTP | Código | Cuándo |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Título o descripción inválidos |
| 401 | `NO_TOKEN`, `INVALID_TOKEN`, `TOKEN_EXPIRED` | Sin sesión válida |
| 429 | `RATE_LIMITED` | Más de 10 generaciones en una hora |
| 502 | `AI_ERROR` | El proveedor rechazó la petición |
| 502 | `AI_INVALID_RESPONSE` | Respuesta cortada, rechazada o con formato inválido |
| 503 | `AI_UNAVAILABLE` | Clave inválida, cuota, red o proveedor saturado |
| 500 | `AI_ERROR` | Fallo inesperado en la capa de IA |

### `GET /projects`

Lista los proyectos del usuario, los más recientes primero.

```bash
curl $API/projects -H "Authorization: Bearer $TOKEN"
```

`200`: `{ "projects": [ ... ] }`. Cada proyecto incluye además:

```json
{ "total_tasks": 8, "completed_tasks": 2, "progress": 25 }
```

### `GET /projects/:id`

```bash
curl $API/projects/$PROJECT_ID -H "Authorization: Bearer $TOKEN"
```

`200`: `{ "project": { ... }, "tasks": [ ... ] }`. El proyecto incluye `total_tasks`, `completed_tasks` y `progress`. Las tareas vienen ordenadas por `order_index`.

Errores: `400`, `401`, `404 PROJECT_NOT_FOUND`.

### `PATCH /projects/:id`

Cuerpo: `status`, que puede ser `pending`, `active` o `completed`.

```bash
curl -X PATCH $API/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}'
```

`200`: `{ "project": { ... } }`, sin los campos de progreso.

Errores: `400`, `401`, `404 PROJECT_NOT_FOUND`.

## Tareas

Todos los endpoints son privados. Una tarea inexistente o de un proyecto ajeno responde `404 TASK_NOT_FOUND`.

### `PATCH /tasks/:id`

Cuerpo: `status`, que puede ser `todo`, `in_progress` o `completed`.

```bash
curl -X PATCH $API/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'
```

`200`: `{ "task": { ... } }`.

Errores: `400`, `401`, `404 TASK_NOT_FOUND`.

### `DELETE /tasks/:id`

```bash
curl -X DELETE $API/tasks/$TASK_ID -H "Authorization: Bearer $TOKEN"
```

`204` sin cuerpo.

Errores: `400`, `401`, `404 TASK_NOT_FOUND`.

## Consumo de IA

### `GET /usage/summary?days=30`

Privada. Devuelve solo los datos del usuario del token. `days` es un entero de 1 a 90 y vale 30 por defecto.

El periodo son los últimos `days` días, con hoy incluido, calculados en UTC.

```bash
curl "$API/usage/summary?days=7" -H "Authorization: Bearer $TOKEN"
```

`200`

```json
{
  "period": { "days": 7, "from": "2026-01-09", "to": "2026-01-15", "timezone": "UTC" },
  "totals": {
    "calls": 11,
    "successful_calls": 10,
    "failed_calls": 1,
    "prompt_tokens": 3632,
    "completion_tokens": 6028,
    "total_tokens": 9660,
    "total_cost_usd": 0.013412,
    "unknown_cost_calls": 0,
    "free_calls": 8
  },
  "latency": { "avg_ms": 8416, "p95_ms": 11708 },
  "daily": [{ "date": "2026-01-09", "calls": 1, "tokens": 870 }],
  "by_model": [
    {
      "provider": "gemini",
      "model": "gemini-3.5-flash-lite",
      "calls": 9,
      "successful_calls": 8,
      "failed_calls": 1,
      "total_tokens": 7730,
      "total_cost_usd": 0,
      "unknown_cost_calls": 0
    }
  ],
  "recent_calls": [
    {
      "id": "44444444-4444-4444-8444-444444444444",
      "created_at": "2026-01-15T10:00:00.000Z",
      "provider": "gemini",
      "model": "gemini-3.5-flash-lite",
      "prompt_tokens": 0,
      "completion_tokens": 0,
      "total_tokens": 0,
      "latency_ms": 1208,
      "status": "error",
      "error_type": "unavailable"
    }
  ]
}
```

| Campo | Significado |
|---|---|
| `totals.total_cost_usd` | Suma de los costes conocidos |
| `totals.unknown_cost_calls` | Llamadas de modelos sin precio conocido |
| `totals.free_calls` | Llamadas con coste 0 que sí consumieron tokens (nivel gratuito) |
| `latency` | Solo llamadas exitosas; `null` si no hay ninguna |
| `daily` | Un elemento por día del periodo, a cero si no hubo actividad |
| `recent_calls` | Las 10 más recientes del periodo |
| `recent_calls[].error_type` | `unavailable`, `invalid_response`, `request_failed`, `unknown`, o `null` si la llamada fue correcta |

El detalle técnico del error no sale de la base de datos.

Errores: `400 VALIDATION_ERROR`, `401`.
