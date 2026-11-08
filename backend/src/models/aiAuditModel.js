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
  provider,
  model,
  promptTokens = 0,
  completionTokens = 0,
  estimatedCostUsd = null, // null = modelo sin precio conocido
  latencyMs = null,
  status,
  errorMessage = null,
}) {
  try {
    const { rows } = await query(
      `INSERT INTO ai_audit_log
         (user_id, project_id, provider, model, prompt_tokens, completion_tokens, total_tokens,
          estimated_cost_usd, latency_ms, status, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        userId,
        projectId,
        provider,
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

// Llamadas del usuario dentro del periodo [$2, $3], fechas 'YYYY-MM-DD' interpretadas en UTC.
// Es un fragmento fijo: los valores van siempre como parámetros.
const IN_PERIOD = `user_id = $1
          AND created_at >= ($2::timestamp AT TIME ZONE 'UTC')
          AND created_at < (($3::timestamp + interval '1 day') AT TIME ZONE 'UTC')`;

/**
 * Agregados de consumo de IA de un usuario en un periodo (días UTC, ambos incluidos).
 * @param {string} userId id del token, nunca un parámetro del cliente
 * @param {{from: string, to: string}} period fechas 'YYYY-MM-DD'
 * @returns {Promise<{totals: object, daily: object[], byModel: object[], recentCalls: object[]}>}
 */
export async function getUsageSummary(userId, { from, to }) {
  const params = [userId, from, to];

  try {
    // Totales y latencia. SUM ignora los costes NULL; la latencia solo cuenta las llamadas exitosas.
    // free_calls: coste 0 con tokens consumidos (un fallo sin tokens también da coste 0 y no es nivel gratuito).
    const totalsQuery = query(
      `SELECT COUNT(*)                                                            AS calls,
              COUNT(*) FILTER (WHERE status = 'success')                          AS successful_calls,
              COUNT(*) FILTER (WHERE status = 'error')                            AS failed_calls,
              COALESCE(SUM(prompt_tokens), 0)                                     AS prompt_tokens,
              COALESCE(SUM(completion_tokens), 0)                                 AS completion_tokens,
              COALESCE(SUM(total_tokens), 0)                                      AS total_tokens,
              COALESCE(SUM(estimated_cost_usd), 0)                                AS total_cost_usd,
              COUNT(*) FILTER (WHERE estimated_cost_usd IS NULL)                  AS unknown_cost_calls,
              COUNT(*) FILTER (WHERE estimated_cost_usd = 0 AND total_tokens > 0) AS free_calls,
              ROUND(AVG(latency_ms) FILTER (WHERE status = 'success'))            AS avg_latency_ms,
              ROUND(percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms)
                    FILTER (WHERE status = 'success'))                            AS p95_latency_ms
         FROM ai_audit_log
        WHERE ${IN_PERIOD}`,
      params,
    );

    // Serie diaria: generate_series crea todos los días y el LEFT JOIN deja a cero los que no tienen llamadas.
    // Los ::timestamp son necesarios: con date, generate_series usaría la zona horaria de la sesión.
    const dailyQuery = query(
      `SELECT to_char(d.day, 'YYYY-MM-DD')     AS date,
              COUNT(l.id)                      AS calls,
              COALESCE(SUM(l.total_tokens), 0) AS tokens
         FROM generate_series($2::timestamp, $3::timestamp, interval '1 day') AS d(day)
         LEFT JOIN ai_audit_log l
           ON l.user_id = $1
          AND l.created_at >= (d.day AT TIME ZONE 'UTC')
          AND l.created_at < ((d.day + interval '1 day') AT TIME ZONE 'UTC')
        GROUP BY d.day
        ORDER BY d.day`,
      params,
    );

    // Desglose por proveedor y modelo, con los más usados primero
    const byModelQuery = query(
      `SELECT provider,
              model,
              COUNT(*)                                           AS calls,
              COUNT(*) FILTER (WHERE status = 'success')         AS successful_calls,
              COUNT(*) FILTER (WHERE status = 'error')           AS failed_calls,
              COALESCE(SUM(total_tokens), 0)                     AS total_tokens,
              COALESCE(SUM(estimated_cost_usd), 0)               AS total_cost_usd,
              COUNT(*) FILTER (WHERE estimated_cost_usd IS NULL) AS unknown_cost_calls
         FROM ai_audit_log
        WHERE ${IN_PERIOD}
        GROUP BY provider, model
        ORDER BY calls DESC, provider, model`,
      params,
    );

    // Últimas 10 llamadas del periodo (usa el índice user_id + created_at DESC)
    const recentCallsQuery = query(
      `SELECT id, created_at, provider, model, prompt_tokens, completion_tokens, total_tokens,
              latency_ms, status, error_message
         FROM ai_audit_log
        WHERE ${IN_PERIOD}
        ORDER BY created_at DESC, id DESC
        LIMIT 10`,
      params,
    );

    const [totals, daily, byModel, recentCalls] = await Promise.all([totalsQuery, dailyQuery, byModelQuery, recentCallsQuery]);
    return { totals: totals.rows[0], daily: daily.rows, byModel: byModel.rows, recentCalls: recentCalls.rows };
  } catch (err) {
    throw toDbError(err, 'Error al consultar el consumo de IA');
  }
}
