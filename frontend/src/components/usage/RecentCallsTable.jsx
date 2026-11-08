import { Fragment } from 'react';
import t from '../../i18n/es.js';
import { formatDateTime, formatInteger, formatLatency } from '../../utils/format.js';
import { CallStatusBadge } from './CallStatusBadge.jsx';

const HEAD_CELL = 'py-2 pr-3 font-medium whitespace-nowrap last:pr-0';
// En móvil estas columnas se ocultan y su dato aparece bajo la fecha
const WIDE_ONLY = 'hidden md:table-cell';

const latencyText = (ms) => (ms === null ? t.usage.noValue : formatLatency(ms));

/** Últimas llamadas a la IA del periodo; el estado siempre lleva texto e icono. */
export function RecentCallsTable({ calls }) {
  return (
    <section aria-labelledby="usage-calls-title" className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <h2 id="usage-calls-title" className="text-lg font-semibold text-slate-900">
        {t.usage.calls.title}
      </h2>
      <p className="mt-1 text-xs text-slate-500">{t.usage.calls.hint}</p>

      <table className="mt-4 w-full text-left text-sm">
        <caption className="sr-only">{t.usage.calls.title}</caption>
        <thead className="text-xs text-slate-500">
          <tr>
            <th scope="col" className={HEAD_CELL}>{t.usage.calls.date}</th>
            <th scope="col" className={`${HEAD_CELL} ${WIDE_ONLY}`}>{t.usage.calls.provider}</th>
            <th scope="col" className={`${HEAD_CELL} ${WIDE_ONLY}`}>{t.usage.calls.model}</th>
            <th scope="col" className={`${HEAD_CELL} text-right`}>{t.usage.calls.tokens}</th>
            <th scope="col" className={`${HEAD_CELL} ${WIDE_ONLY} text-right`}>{t.usage.calls.latency}</th>
            <th scope="col" className={HEAD_CELL}>{t.usage.calls.status}</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {calls.map((call) => (
            <Fragment key={call.id}>
              <tr className="border-t border-slate-100 align-top">
                <td className="py-2.5 pr-3">
                  <span className="whitespace-nowrap">{formatDateTime(call.created_at)}</span>
                  <span className="mt-0.5 block text-xs wrap-anywhere text-slate-500 md:hidden">
                    {t.usage.calls.compactMeta(call.provider, call.model, latencyText(call.latency_ms))}
                  </span>
                </td>
                <td className={`py-2.5 pr-3 ${WIDE_ONLY}`}>{call.provider}</td>
                <td className={`py-2.5 pr-3 wrap-anywhere ${WIDE_ONLY}`}>{call.model}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums">{formatInteger(call.total_tokens)}</td>
                <td className={`py-2.5 pr-3 text-right whitespace-nowrap tabular-nums ${WIDE_ONLY}`}>{latencyText(call.latency_ms)}</td>
                <td className="py-2.5">
                  <CallStatusBadge status={call.status} />
                </td>
              </tr>
              {call.status === 'error' && (
                <tr>
                  <td colSpan={6} className="pb-2.5 text-xs text-slate-600">
                    <span className="font-medium">{t.usage.calls.errorPrefix}</span>{' '}
                    {t.usage.calls.errorTypes[call.error_type] ?? t.usage.calls.errorTypes.unknown}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </section>
  );
}
