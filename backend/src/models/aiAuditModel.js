import { query } from '../config/database.js';
import { toDbError, isInvalidInput } from '../utils/errors.js';

/**
 * Registra una llamada a la IA (exitosa o fallida).
 * total_tokens se calcula aquí para que nunca quede inconsistente.
 * @returns {Promise<object>} registro creado
 */
export async function create({
  userId,
  projectId = null,
  model,
  promptTokens = 0,
  completionTokens = 0,
  estimatedCostUsd = 0,
  latencyMs = null,
  status,
  errorMessage = null,
}) {
  try {
    const { rows } = await query(
      `INSERT INTO ai_audit_log
         (user_id, project_id, model, prompt_tokens, completion_tokens, total_tokens,
          estimated_cost_usd, latency_ms, status, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        projectId,
        model,
        promptTokens,
        completionTokens,
        promptTokens + completionTokens,
        estimatedCostUsd,
        latencyMs,
        status,
        errorMessage,
      ],
    );
    return rows[0];
  } catch (err) {
    throw toDbError(err, 'Error al registrar auditoría de IA');
  }
}

/**
 * Historial de llamadas a la IA de un usuario + totales, para el dashboard de consumo.
 * @returns {Promise<{logs: object[], summary: object}>}
 */
export async function findByUserId(userId, { limit = 50, offset = 0 } = {}) {
  try {
    // Últimas llamadas, paginadas (usa el índice user_id + created_at DESC)
    const logsQuery = query(
      `SELECT *
         FROM ai_audit_log
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
      [userId, Math.min(limit, 200), offset],
    );

    // Totales de todo el historial; COALESCE devuelve 0 en vez de NULL si no hay filas
    const summaryQuery = query(
      `SELECT COUNT(*)                                     AS total_calls,
              COUNT(*) FILTER (WHERE status = 'error')     AS failed_calls,
              COALESCE(SUM(total_tokens), 0)               AS total_tokens,
              COALESCE(SUM(estimated_cost_usd), 0)         AS total_cost_usd,
              COALESCE(ROUND(AVG(latency_ms)), 0)          AS avg_latency_ms
         FROM ai_audit_log
        WHERE user_id = $1`,
      [userId],
    );

    // Las dos queries son independientes: se ejecutan en paralelo
    const [logsResult, summaryResult] = await Promise.all([logsQuery, summaryQuery]);
    return { logs: logsResult.rows, summary: summaryResult.rows[0] };
  } catch (err) {
    if (isInvalidInput(err)) {
      return {
        logs: [],
        summary: { total_calls: 0, failed_calls: 0, total_tokens: 0, total_cost_usd: 0, avg_latency_ms: 0 },
      };
    }
    throw toDbError(err, 'Error al consultar auditoría de IA');
  }
}
