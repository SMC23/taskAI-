# TaskAI

Gestor de tareas inteligente: describes tu proyecto en lenguaje natural y la IA genera automáticamente una lista de tareas ordenadas y priorizadas.

> Ejemplo: *"Quiero lanzar mi tienda online de ropa en 2 meses"* → TaskAI propone las tareas, su prioridad y su orden.

## Funcionalidades

1. Registro e inicio de sesión (JWT)
2. Creación de proyectos a partir de una descripción en lenguaje natural
3. Generación automática de tareas con la API de Anthropic (Claude)
4. Completar, editar y eliminar tareas
5. Dashboard con el progreso visual de cada proyecto

## Stack

| Capa          | Tecnología                          |
|---------------|-------------------------------------|
| Frontend      | React, Vite, TailwindCSS, React Router |
| Backend       | Node.js, Express                    |
| Base de datos | PostgreSQL                          |
| IA            | Anthropic API (Claude)              |
| Auth          | JWT + bcrypt                        |
| Despliegue    | AWS (planificado)                   |

## Estructura

```
taskAI/
├── backend/                 API REST (Express)
│   ├── migrations/          Migraciones SQL versionadas (node-pg-migrate)
│   ├── tests/               Tests de la API (Vitest + Supertest)
│   └── src/
│       ├── config/          Variables de entorno, conexión a la BD
│       ├── routes/          Definición de endpoints
│       ├── controllers/     Manejo de request/response
│       ├── services/        Lógica de negocio
│       │   └── ai/          Integración con Anthropic
│       ├── models/          Acceso a datos (consultas SQL)
│       ├── middlewares/     Auth JWT, errores, rate limiting
│       ├── validators/      Esquemas de validación (Zod)
│       └── utils/           Utilidades compartidas
├── frontend/                SPA (React + Vite)
│   ├── public/              Archivos estáticos
│   └── src/
│       ├── api/             Cliente HTTP y llamadas a la API
│       ├── assets/          Imágenes, iconos
│       ├── components/      Componentes reutilizables (ui, layout, tasks, projects)
│       ├── context/         Estado global (sesión del usuario)
│       ├── hooks/           Custom hooks
│       ├── pages/           Vistas (Login, Dashboard, Proyecto…)
│       ├── routes/          Rutas y rutas protegidas
│       └── utils/           Utilidades
└── docs/                    Documentación técnica
```

## Requisitos

- Node.js 20.19 o superior
- PostgreSQL 15 o superior
- Una API key de Anthropic

## Puesta en marcha (cuando exista el código)

```bash
# Backend
cd backend
cp .env.example .env      # rellena los valores
npm install
npm run migrate:up
npm run dev               # http://localhost:4000

# Frontend (en otra terminal)
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## Estado

🚧 Paso 1 completado: estructura y configuración inicial.
