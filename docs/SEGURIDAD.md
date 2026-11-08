# Seguridad

Amenazas consideradas, cómo se mitigan y qué falta. El proyecto no ha pasado una auditoría externa ni está desplegado.

Volver al [README](../README.md).

## Amenazas y mitigaciones

| Amenaza | Mitigación | Dónde | Estado |
|---|---|---|---|
| Acceso a recursos ajenos (IDOR) | El dueño se comprueba en la misma sentencia SQL; un recurso ajeno da 404 | `models/projectModel.js`, `models/taskModel.js` | Implementado |
| Inyección SQL | Consultas parametrizadas; los fragmentos interpolados son constantes del código | `models/` | Implementado |
| Datos de entrada inválidos | Zod en cuerpo, parámetros y query; los campos no declarados se descartan | `validators/` | Implementado |
| Fuerza bruta en el login | 20 intentos por IP cada 15 min; bcrypt con 12 rondas | `middlewares/rateLimiters.js` | Parcial: solo por IP |
| Enumeración de usuarios en el login | Respuesta idéntica y `bcrypt.compare` siempre, con hash ficticio | `services/authService.js` | Implementado |
| Enumeración de usuarios en el registro | Ninguna: responde `409 EMAIL_IN_USE` | `services/authService.js` | **Pendiente** |
| Manipulación del JWT | Firma verificada y algoritmo fijado a HS256, lo que impide `none` | `middlewares/auth.js` | Implementado |
| Robo del token por XSS | React escapa el contenido y no se usa `dangerouslySetInnerHTML`, pero el token está en `localStorage` | `utils/tokenStorage.js` | **Parcial** |
| CSRF | El token va en una cabecera, no en una cookie, así que el navegador no lo envía solo | `api/client.js` | No aplica con el diseño actual |
| Origen no autorizado | CORS limitado a `CLIENT_URL` | `config/app.js` | Implementado |
| Cuerpos muy grandes | `express.json` limitado a 100 KB | `config/app.js` | Implementado; responde 500 en lugar de 413 |
| Salida inválida de la IA | JSON Schema, validación con Zod y 502 sin guardar nada | `services/ai/taskGenerator.js` | Implementado |
| Inyección de prompt | Texto delimitado con `<proyecto>`, instrucción en el prompt de sistema, salida limitada al esquema y modelo sin herramientas | `services/ai/taskGenerator.js` | Parcial: ver abajo |
| Abuso del coste de IA | 10 generaciones por hora e IP; auditoría de cada llamada | `middlewares/rateLimiters.js` | Parcial: por IP, sin tope por usuario |
| Fuga de detalles técnicos | Error de IA genérico para el usuario; `toDbError` no expone SQL; en producción se oculta el mensaje de errores inesperados | `services/usageService.js`, `utils/errors.js`, `middlewares/errorHandler.js` | Implementado |
| Filtración de secretos | `.env` excluido de git; los mensajes de configuración nunca incluyen el valor de las claves | `.gitignore`, `services/ai/providers/index.js` | Implementado |
| Secretos en los logs | Una línea por error, sin volcar cabeceras ni cuerpos | `middlewares/errorHandler.js` | Implementado |

Las rutas de la tabla son relativas a `backend/src` o `frontend/src`.

## Inyección de prompt

No se puede eliminar del todo. El título y la descripción se insertan sin escapar dentro de `<proyecto>`, así que un usuario podría cerrar la etiqueta e intentar dar instrucciones.

El alcance queda limitado porque el modelo no tiene herramientas ni acceso a datos, la salida debe cumplir el esquema y React escapa el texto al mostrarlo. Lo peor que puede conseguir un usuario es generar tareas absurdas en su propio proyecto.

## Privacidad

- La descripción y el título de cada proyecto se envían al proveedor de IA.
- En el nivel gratuito de Gemini, Google puede usar ese contenido para mejorar sus productos.
- Las peticiones a Gemini se hacen con `store: false`.

## Qué falta

Por orden aproximado de prioridad:

1. **Cookie `httpOnly`** con `Secure` y `SameSite`, y protección CSRF, en lugar de `localStorage`.
2. **Revocación de sesiones.** Cerrar sesión solo borra el token del navegador; sigue siendo válido hasta 7 días. Harían falta tokens de acceso cortos y refresh tokens revocables.
3. **Límites compartidos y por usuario.** Hoy se guardan en memoria, se reinician con el servidor y no se comparten entre instancias. Varios usuarios tras una misma IP comparten cupo.
4. **Exigir un `JWT_SECRET` largo.** El servidor solo comprueba que exista.
5. **Content-Security-Policy en el frontend.** helmet solo protege las respuestas de la API; la cabecera del frontend depende del servidor que lo aloje.
6. **HTTPS.** Debe resolverlo el despliegue. helmet envía `Strict-Transport-Security`, que solo tiene efecto sobre HTTPS.
7. **Registro sin enumeración.** Requiere verificación de email: responder siempre lo mismo y avisar por correo.
8. **Recuperación de contraseña y verificación de email.** No existen.
9. **Retención de datos.** `ai_audit_log` crece sin límite y no hay política de borrado.
10. **Análisis de dependencias en CI.** `npm audit --omit=dev` no encontró vulnerabilidades en backend ni frontend el 8 de noviembre de 2026; el backend tiene 3 moderadas en dependencias de desarrollo.
