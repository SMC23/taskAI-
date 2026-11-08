import * as aiAuditModel from '../models/aiAuditModel.js';
import { classifyAuditError } from './ai/errors.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const toUtcDate = (timestamp) => new Date(timestamp).toISOString().slice(0, 10);

/**
 * Resumen de consumo de IA del usuario en los últimos `days` días, hoy incluido.
 * Los días se calculan en UTC y el periodo se fija una sola vez, para que todas
 * las consultas usen el mismo rango aunque se ejecuten justo al cambiar de día.
 */
export async function getSummary(userId, days) {
  const now = Date.now();
  const to = toUtcDate(now);
  const from = toUtcDate(now - (days - 1) * DAY_MS);

  const { totals, daily, byModel, recentCalls } = await aiAuditModel.getUsageSummary(userId, { from, to });
  const { avg_latency_ms: avgMs, p95_latency_ms: p95Ms, ...callTotals } = totals;

  return {
    period: { days, from, to, timezone: 'UTC' },
    totals: callTotals,
    latency: { avg_ms: avgMs, p95_ms: p95Ms }, // null si no hay llamadas exitosas
    daily,
    by_model: byModel,
    // error_message es detalle técnico: se queda en la base de datos y al cliente solo llega el tipo
    recent_calls: recentCalls.map(({ error_message: errorMessage, ...call }) => ({
      ...call,
      error_type: call.status === 'error' ? classifyAuditError(errorMessage) : null,
    })),
  };
}
