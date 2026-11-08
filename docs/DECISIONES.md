# Decisiones técnicas

Registro breve de las decisiones que condicionan el diseño y de las alternativas que no se adoptaron.

Volver al [README](../README.md).

## D1. Contrato común de proveedores de IA

- **Decisión:** cada proveedor implementa `generateStructured` y traduce sus errores a unos comunes. `AI_PROVIDER` elige cuál se usa.
- **Por qué:** `taskGenerator` no conoce ningún SDK, y cambiar o añadir un proveedor no lo modifica.
- **Alternativa descartada:** llamar al SDK desde el servicio. Dejaría la lógica de prompts y auditoría acoplada a un proveedor.

## D2. Un solo esquema para pedir y validar la salida de la IA

- **Decisión:** el esquema Zod genera con `z.toJSONSchema` lo que se envía al modelo, y después valida la respuesta.
- **Por qué:** la IA es una fuente externa. Definir ambas cosas en un solo lugar evita que se desalineen.
- **Alternativa descartada:** confiar en la salida estructurada del proveedor sin validar.

## D3. La llamada a la IA fuera de la transacción

- **Decisión:** primero se llama a la IA y después se abre una transacción de dos `INSERT`.
- **Por qué:** una llamada de segundos dentro de la transacción retendría una de las 10 conexiones del pool.
- **Alternativa descartada:** todo dentro de una transacción. La atomicidad sería la misma para los datos propios, pero con riesgo de agotar el pool.
- **Coste aceptado:** si la transacción falla después de la IA, los tokens ya se gastaron.

## D4. `project_id` de la auditoría sin clave foránea

- **Decisión:** la migración `1761436800005` elimina la FK.
- **Por qué:** la auditoría se escribe antes de que exista el proyecto, o cuando nunca existirá.
- **Alternativa descartada:** mantener la FK y escribir la auditoría después. Se perderían los registros de las llamadas fallidas, que también cuestan.

## D5. Coste `NULL` si no hay precio conocido

- **Decisión:** la migración `1761436800006` permite `NULL` en `estimated_cost_usd`.
- **Por qué:** `0` significa gratuito; `NULL` significa desconocido. El panel los muestra distinto.
- **Alternativa descartada:** registrar 0 o un precio aproximado.

## D6. SQL con `pg`, sin ORM

- **Decisión:** los modelos contienen SQL parametrizado.
- **Por qué:** consultas como `UPDATE ... FROM`, `FILTER`, `percentile_cont` o `generate_series` quedan escritas tal como se ejecutan.
- **Alternativa no adoptada:** un ORM, que ahorraría código repetitivo a cambio de ocultar esas consultas.

## D7. Autorización en la propia sentencia SQL

- **Decisión:** `WHERE ... AND user_id = $2`, o un `JOIN` con `projects` en el caso de las tareas.
- **Por qué:** comprobación y modificación son una sola operación, sin hueco entre ambas, y no se puede olvidar el filtro en un paso aparte.
- **Alternativa descartada:** leer el recurso, comparar el dueño en Node y luego escribir.

## D8. 404, y no 403, para recursos ajenos

- **Decisión:** un recurso ajeno responde igual que uno inexistente.
- **Por qué:** un 403 confirmaría que el id existe.

## D9. Comparación con un hash ficticio en el login

- **Decisión:** `bcrypt.compare` se ejecuta siempre, contra `DUMMY_HASH` si el email no existe.
- **Por qué:** sin esto, el login respondería mucho más rápido cuando el email no existe y revelaría qué cuentas hay.

## D10. Token JWT en `localStorage`

- **Decisión:** el frontend guarda el token en `localStorage` y lo envía en la cabecera `Authorization`.
- **Por qué:** es sencillo, la sesión sobrevive a recargas y, al no usar cookies, no requiere protección CSRF.
- **Alternativa no adoptada:** cookie `httpOnly` con `Secure` y `SameSite`. Un XSS no podría leer el token. Es la recomendada para producción, y exige cambiar el backend y añadir protección CSRF.

## D11. Reintentos propios en Gemini

- **Decisión:** `maxRetries: 0` en el SDK y reintentos propios ante 503 y 429.
- **Por qué:** en `@google/genai` 2.32.0, los reintentos del SDK fallan con `TypeError: unusable` y ocultan el error real.
- **Alternativa descartada:** los reintentos automáticos del SDK.

## D12. Agregaciones en SQL y días en UTC

- **Decisión:** el panel de consumo agrega en PostgreSQL y calcula los días en UTC, con el periodo fijado una sola vez por petición.
- **Por qué:** no se traen todas las filas a Node, y todas las consultas usan el mismo rango aunque se ejecuten al cambiar de día.
- **Alternativa descartada:** agregar en Node.
- **Coste aceptado:** un usuario en otra zona horaria puede ver una llamada en un día distinto del de su hora local.

## D13. Gráfica en HTML y Tailwind

- **Decisión:** sin librería de gráficas.
- **Por qué:** una sola serie de barras no justifica otra dependencia. Permite controlar el teclado (una parada de Tab y flechas) y añadir una tabla para lectores de pantalla.
- **Alternativa descartada:** una librería de gráficas.

## D14. Estado optimista, borrado no optimista

- **Decisión:** el cambio de estado se aplica al momento y se revierte si falla. El borrado espera la confirmación.
- **Por qué:** un cambio de estado es frecuente y reversible. Una tarea borrada que reaparece confunde.

## D15. `error_type` deducido del texto guardado

- **Decisión:** `classifyAuditError` deduce un tipo genérico a partir de `error_message`, y la API solo envía el tipo.
- **Por qué:** el detalle técnico no debe llegar al usuario, y así funciona también con las filas existentes, sin migración.
- **Alternativa no adoptada:** una columna `error_code`, más fiable a largo plazo. Si cambia el formato del mensaje, el error se mostraría como inesperado, sin exponer nada.
