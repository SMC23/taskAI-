import t from '../../i18n/es.js';
import { formatInteger, formatLatency, formatPercent, formatUsd } from '../../utils/format.js';

/**
 * Qué mostrar como coste. Un 0 no siempre significa lo mismo:
 * - free_calls: consumió tokens a precio 0 → nivel gratuito.
 * - unknown_cost_calls: coste NULL → modelo sin precio conocido.
 * - Ninguno de los dos: llamadas fallidas que no llegaron a consumir tokens.
 */
function describeCost({ total_cost_usd: cost, free_calls: free, unknown_cost_calls: unknown }) {
  const unknownNote = unknown > 0 ? t.usage.cost.unknownNote(unknown) : null;
  if (cost > 0) return { value: formatUsd(cost), detail: unknownNote ?? t.usage.cost.estimated };
  if (free > 0) return { value: t.usage.cost.free, detail: unknownNote, isText: true };
  if (unknown > 0) return { value: t.usage.cost.unknown, detail: t.usage.cost.unknownDetail(unknown), isText: true };
  return { value: t.usage.cost.noUsage, detail: t.usage.cost.noUsageDetail, isText: true };
}

function StatCard({ label, value, detail, isText = false, className = '' }) {
  return (
    <div className={`rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 ${className}`}>
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className={`mt-1 font-semibold text-slate-900 ${isText ? 'text-base' : 'text-2xl'}`}>{value}</dd>
      {detail && <dd className="mt-1 text-xs text-slate-500">{detail}</dd>}
    </div>
  );
}

/** Tarjetas con los totales del periodo. */
export function UsageStatCards({ totals, latency }) {
  const { calls, successful_calls: successful, failed_calls: failed, prompt_tokens: input, completion_tokens: output } = totals;

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <StatCard label={t.usage.cards.calls} value={formatInteger(calls)} detail={t.usage.cards.callsDetail(failed)} />
      <StatCard
        label={t.usage.cards.tokens}
        value={formatInteger(totals.total_tokens)}
        detail={t.usage.cards.tokensDetail(formatInteger(input), formatInteger(output))}
      />
      <StatCard
        label={t.usage.cards.latency}
        value={latency.avg_ms === null ? t.usage.noValue : formatLatency(latency.avg_ms)}
        detail={latency.p95_ms === null ? t.usage.cards.latencyEmpty : t.usage.cards.latencyDetail(formatLatency(latency.p95_ms))}
      />
      <StatCard
        label={t.usage.cards.successRate}
        value={formatPercent(successful / calls)}
        detail={t.usage.cards.successDetail(formatInteger(successful), formatInteger(calls))}
      />
      <StatCard label={t.usage.cards.cost} className="col-span-2 lg:col-span-1" {...describeCost(totals)} />
    </dl>
  );
}
