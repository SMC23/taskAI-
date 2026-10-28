import { query } from '../config/database.js';
import { toDbError, isInvalidInput } from '../utils/errors.js';

export const TASK_PRIORITIES = ['low', 'medium', 'high'];
export const TASK_STATUSES = ['todo', 'in_progress', 'completed'];

// Columnas por tarea en el bulk insert; con 5 columnas, PostgreSQL (máx. 65.535
// parámetros por query) admite miles de tareas, muy por encima de lo que genera la IA.
const INSERT_COLUMNS = ['project_id', 'title', 'description', 'priority', 'order_index'];

/**
 * Lista las tareas de un proyecto en su orden.
 * @returns {Promise<object[]>}
 */
export async function findByProjectId(projectId) {
  try {
    // created_at desempata si dos tareas tienen el mismo order_index
    const { rows } = await query(
      `SELECT *
         FROM tasks
        WHERE project_id = $1
        ORDER BY order_index ASC, created_at ASC`,
      [projectId],
    );
    return rows;
  } catch (err) {
    if (isInvalidInput(err)) return [];
    throw toDbError(err, 'Error al listar tareas');
  }
}

/**
 * Inserta varias tareas de un proyecto en UNA sola query (bulk insert).
 * Si una tarea falla, no se inserta ninguna.
 *
 * @param {string} projectId
 * @param {Array<{title: string, description?: string, priority?: string, orderIndex?: number}>} tasks
 * @param {import('pg').PoolClient} [client] cliente de una transacción en curso
 * @returns {Promise<object[]>} tareas creadas, en orden
 */
export async function create(projectId, tasks, client) {
  if (!Array.isArray(tasks) || tasks.length === 0) return [];

  try {
    const values = [];
    // Genera "($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10), ..." con un placeholder por valor.
    // Los datos van siempre como parámetros, nunca concatenados: así no hay inyección SQL.
    const rowsSql = tasks.map((task, i) => {
      values.push(
        projectId,
        task.title.trim(),
        task.description ?? null,
        task.priority ?? 'medium',
        task.orderIndex ?? i, // si no viene orden, se usa la posición en el array
      );
      const offset = i * INSERT_COLUMNS.length;
      const placeholders = INSERT_COLUMNS.map((_, col) => `$${offset + col + 1}`);
      return `(${placeholders.join(', ')})`;
    });

    const db = client ?? { query };
    const { rows } = await db.query(
      `INSERT INTO tasks (${INSERT_COLUMNS.join(', ')})
       VALUES ${rowsSql.join(', ')}
       RETURNING *`,
      values,
    );
    return rows.sort((a, b) => a.order_index - b.order_index);
  } catch (err) {
    throw toDbError(err, 'Error al crear tareas');
  }
}

/**
 * Cambia el estado de una tarea. Solo la actualiza si su proyecto pertenece a userId,
 * para que nadie pueda modificar tareas ajenas adivinando el id.
 * @returns {Promise<object|null>} tarea actualizada, o null si no existe / no es suya
 */
export async function updateStatus(id, userId, status) {
  try {
    // UPDATE ... FROM hace el JOIN con projects para comprobar el dueño
    const { rows } = await query(
      `UPDATE tasks t
          SET status = $3
         FROM projects p
        WHERE t.id = $1
          AND t.project_id = p.id
          AND p.user_id = $2
        RETURNING t.*`,
      [id, userId, status],
    );
    return rows[0] ?? null;
  } catch (err) {
    throw toDbError(err, 'Error al actualizar estado de la tarea');
  }
}

/**
 * Elimina una tarea si su proyecto pertenece a userId.
 * Se exporta como `delete` (palabra reservada como nombre de función, no como export).
 * @returns {Promise<boolean>} true si se eliminó
 */
async function deleteTask(id, userId) {
  try {
    // DELETE ... USING es el equivalente a un JOIN en un DELETE
    const { rowCount } = await query(
      `DELETE FROM tasks t
        USING projects p
        WHERE t.id = $1
          AND t.project_id = p.id
          AND p.user_id = $2`,
      [id, userId],
    );
    return rowCount > 0;
  } catch (err) {
    if (isInvalidInput(err)) return false;
    throw toDbError(err, 'Error al eliminar tarea');
  }
}

export { deleteTask as delete };
