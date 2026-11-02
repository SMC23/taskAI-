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



## Notas mias , entendimiento 
taskAI/
├── .gitignore
├── README.md
├── docs/
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── migrations/
│   ├── tests/
│   └── src/{config, routes, controllers, services/ai, models, middlewares, validators, utils}
└── frontend/
    ├── package.json
    ├── .env.example
    ├── public/
    └── src/{api, assets, components/{ui,layout,tasks,projects}, context, hooks, pages, routes, utils}

Para el backend 
 las rutas - sirven para dirijirlos a la peticion http , donde recibe y enviea peticiones 
--services- ya es la logica como tal , valida los datos y despues se llama a ala ia y luego guarda las tareas generadas , no hace nada de http  ni sql 

-models - es el unico que habal con la base dee datos y hace querys 

Esto se llama separación de responsabilidades y es lo que separa código profesional de código de tutorial.
 


 al correr el backed hya un error comun que es el attach muy comun 
 para ejcutar el servidor sin importar se hace de la siguienete manera Ñode --env-file=.env server.js
ÑCreé .vscode/settings.json, que pone el Auto Attach en "Only With Flag" solo para este proyecto. Ya no interferirá con npm run dev, y el depurador se sigue pudiendo usar cuando lo pidas expresamente con --inspect. El .gitignore del Paso 1 ya permite subir este archivo, así que la configuración viaja con el repo.

Para que se aplique, cierra la terminal actual, abre una nueva y ejecuta npm run dev dentro de backend. Con --watch, el servidor se reiniciará solo cada vez que guardes un archivo.
 solucion 


 zod sirve para transformar o vallidar un formato que tenaga aya por defecto
 Añade lo más peligroso: un JSON que parece válido pero con datos mal formados puede guardarse en la base de datos y el problema aparece días después. Y la idea de fondo: la IA es una fuente externa, y a las fuentes externas no se les confía ciegamente, igual que al usuario. 
 Pregunta 1: bien, pero te falta la parte clave.
Dijiste que la transacción permite hacer rollback si algo falla. Eso es correcto. Lo que falta es por qué importa aquí: un proyecto sin tareas es un estado roto. Si se guarda el proyecto y falla el guardado de las tareas, el usuario ve un proyecto vacío que nunca pidió. La transacción garantiza todo o nada. En entrevista, la frase corta es: “para que nunca quede un proyecto a medias en la base de datos”.


“Para que un atacante no pueda descubrir qué emails están registrados.” estsos e hace dana,do una repsusta en negativo de el correo y la contrasena 

jwt 
Piensa en una manilla de concierto con un sello holográfico.

La manilla dice quién eres y hasta cuándo vale. Cualquiera puede leerla. Pero el sello holográfico solo lo puede hacer el organizador. Si alguien intenta falsificar la manilla o cambiarle el nombre, el sello no coincide y el guardia la rechaza.

Un JWT tiene tres partes:

Cabecera: el algoritmo usado.
Payload: los datos. En el tuyo: tu userId, cuándo se emitió y cuándo caduca (7 días).
Firma: el sello. Se calcula con tu JWT_SECRET, que solo conoce el servidor.

las fuentes exterenas no se les confia directaamente 

La firma se calcula una vez, al crear el token, mezclando el header y el payload con el JWT_SECRET, que solo conoce el servidor.
Te faltó también la segunda mitad de la pregunta: quién puede leerlo. Cualquiera que tenga el token puede leer el payload, porque está codificado y no cifrado. Pero solo el servidor puede crear uno válido.



zod se utiliza para aavalidar un json aya que la repsuesta de un