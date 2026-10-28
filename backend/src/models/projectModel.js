import { query } from '../config/database.js';
import { toDbError, isInvalidInput } from '../utils/errors.js';

export const PROJECT_STATUSES = ['pending', 'active', 'completed'];

/**
 * Lista los proyectos de un usuario, los más recientes primero, con el
 * recuento de tareas para pintar la barra de progreso del dashboard.
 * @returns {Promise<object[]>}
 */
export async function findByUserId(userId) {
  try {
    // LEFT JOIN para incluir proyectos sin tareas; FILTER cuenta solo las completadas
    const { rows } = await query(
      `SELECT p.*,
              COUNT(t.id)                                      AS total_tasks,
              COUNT(t.id) FILTER (WHERE t.status = 'completed') AS completed_tasks
         FROM projects p
         LEFT JOIN tasks t ON t.project_id = p.id
        WHERE p.user_id = $1
        GROUP BY p.id
        ORDER BY p.created_at DESC`,
      [userId],
    );
    return rows;
  } catch (err) {
    if (isInvalidInput(err)) return [];
    throw toDbError(err, 'Error al listar proyectos');
  }
}

/**
 * Busca un proyecto por id. Si se pasa userId, solo lo devuelve si pertenece
 * a ese usuario: así un usuario no puede leer proyectos ajenos cambiando el id.
 * @returns {Promise<object|null>}
 */
export async function findById(id, userId) {
  try {
    // ($2::uuid IS NULL OR ...) hace el filtro por dueño opcional
    const { rows } = await query(
      `SELECT *
         FROM projects
        WHERE id = $1
          AND ($2::uuid IS NULL OR user_id = $2)`,
      [id, userId ?? null],
    );
    return rows[0] ?? null;
  } catch (err) {
    if (isInvalidInput(err)) return null;
    throw toDbError(err, 'Error al buscar proyecto');
  }
}

/**
 * Crea un proyecto. Acepta un `client` opcional para ejecutarse dentro de una
 * transacción (crear proyecto + tareas generadas por la IA de forma atómica).
 * @returns {Promise<object>}
 */
export async function create({ userId, title, description = null, status = 'pending' }, client) {
  try {
    const db = client ?? { query };
    const { rows } = await db.query(
      `INSERT INTO projects (user_id, title, description, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, title.trim(), description, status],
    );
    return rows[0];
  } catch (err) {
    throw toDbError(err, 'Error al crear proyecto');
  }
}

/**
 * Cambia el estado de un proyecto del usuario indicado.
 * @returns {Promise<object|null>} proyecto actualizado, o null si no existe / no es suyo
 */
export async function updateStatus(id, userId, status) {
  try {
    // El filtro por user_id garantiza que solo el dueño pueda modificarlo
    const { rows } = await query(
      `UPDATE projects
          SET status = $3
        WHERE id = $1 AND user_id = $2
        RETURNING *`,
      [id, userId, status],
    );
    return rows[0] ?? null;
  } catch (err) {
    throw toDbError(err, 'Error al actualizar estado del proyecto');
  }
}
