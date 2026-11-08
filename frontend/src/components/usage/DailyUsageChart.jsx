import { useState } from 'react';
import t from '../../i18n/es.js';
import { formatDayLong, formatDayShort, formatInteger } from '../../utils/format.js';

const NICE_STEPS = [1, 2, 4, 6, 8, 10];

/** Techo "redondo" del eje Y; todos los pasos tienen una mitad entera (salvo el 1). */
function niceMax(value) {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(value, 1)));
  return NICE_STEPS.find((step) => step * magnitude >= value) * magnitude;
}

/** Marcas del eje X: una por día en periodos cortos; si no, ~6 contando hacia atrás desde hoy. */
const xTickStep = (count) => (count <= 7 ? 1 : Math.ceil(count / 6));

const barLabel = ({ date, calls, tokens }) => t.usage.chart.barLabel(formatDayLong(date), calls, formatInteger(tokens));

/** Gráfica de barras: llamadas por día. La tabla oculta da los mismos datos a lectores de pantalla. */
export function DailyUsageChart({ daily }) {
  const [activeIndex, setActiveIndex] = useState(null); // barra con hover o foco: su valor se muestra
  const [focusIndex, setFocusIndex] = useState(daily.length - 1); // la única barra alcanzable con Tab

  const count = daily.length;
  const yMax = niceMax(Math.max(...daily.map((day) => day.calls)));
  const yTicks = yMax === 1 ? [0, 1] : [0, yMax / 2, yMax];
  const tickStep = xTickStep(count);
  const active = activeIndex === null ? null : daily[activeIndex];
  const activeX = ((activeIndex + 0.5) / count) * 100;

  // Una sola parada de Tab para toda la gráfica; las flechas recorren los días
  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setActiveIndex(null);
      return;
    }
    const targets = { ArrowLeft: focusIndex - 1, ArrowRight: focusIndex + 1, Home: 0, End: count - 1 };
    const next = targets[event.key];
    if (next === undefined || next < 0 || next >= count) return;
    event.preventDefault();
    setFocusIndex(next);
    event.currentTarget.querySelectorAll('button')[next].focus();
  }

  return (
    <section aria-labelledby="usage-chart-title" className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <h2 id="usage-chart-title" className="text-lg font-semibold text-slate-900">
        {t.usage.chart.title}
      </h2>
      <p className="mt-1 text-xs text-slate-500">{t.usage.chart.hint}</p>

      <div className="mt-6 flex">
        <div aria-hidden="true" className="relative mr-2 h-48 w-7 shrink-0 text-right text-xs text-slate-500">
          {yTicks.map((tick) => (
            <span key={tick} className="absolute right-0 translate-y-1/2" style={{ bottom: `${(tick / yMax) * 100}%` }}>
              {formatInteger(tick)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-48">
            {yTicks.slice(1).map((tick) => (
              <div key={tick} className="absolute inset-x-0 border-t border-slate-100" style={{ bottom: `${(tick / yMax) * 100}%` }} />
            ))}
          </div>

          <div
            role="group"
            aria-label={t.usage.chart.barsLabel}
            onKeyDown={handleKeyDown}
            onPointerLeave={() => setActiveIndex(null)}
            className="relative flex h-48 border-b border-slate-300"
          >
            {daily.map((day, index) => {
              const isActive = index === activeIndex;
              const barHeight = day.calls === 0 ? '0' : `max(3px, ${(day.calls / yMax) * 100}%)`;
              return (
                <button
                  key={day.date}
                  type="button"
                  tabIndex={index === focusIndex ? 0 : -1}
                  aria-label={barLabel(day)}
                  onPointerEnter={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  onFocus={() => {
                    setActiveIndex(index);
                    setFocusIndex(index);
                  }}
                  onBlur={() => setActiveIndex(null)}
                  className={`flex h-full min-w-0 flex-1 items-end justify-center focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 ${count > 30 ? 'pr-px sm:px-px' : 'px-px'} ${isActive ? 'bg-indigo-50' : ''}`}
                >
                  <span
                    className={`block w-full max-w-6 rounded-t ${isActive ? 'bg-indigo-800' : 'bg-indigo-600'}`}
                    style={{ height: barHeight }}
                  />
                </button>
              );
            })}
          </div>

          {active && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1 z-10 rounded-lg bg-slate-900 px-3 py-2 text-xs whitespace-nowrap text-slate-300 shadow-lg"
              style={activeX < 50 ? { left: `calc(${activeX}% + 10px)` } : { right: `calc(${100 - activeX}% + 10px)` }}
            >
              <p>{formatDayShort(active.date)}</p>
              <p>
                <span className="font-semibold text-white">{formatInteger(active.calls)}</span> {t.usage.chart.callsUnit(active.calls)}
              </p>
              <p>
                <span className="font-semibold text-white">{formatInteger(active.tokens)}</span> {t.usage.chart.tokensUnit}
              </p>
            </div>
          )}

          <div aria-hidden="true" className="relative mt-1 h-4 text-xs text-slate-500">
            {daily.map((day, index) =>
              (count - 1 - index) % tickStep === 0 ? (
                <span
                  key={day.date}
                  className="absolute -translate-x-1/2 whitespace-nowrap"
                  style={{ left: `${((index + 0.5) / count) * 100}%` }}
                >
                  {formatDayShort(day.date)}
                </span>
              ) : null,
            )}
          </div>
        </div>
      </div>

      {/* El contenedor oculta la tabla: un <table> con sr-only ignora el alto de 1px y alarga la página */}
      <div className="sr-only">
        <table>
          <caption>{t.usage.chart.tableCaption}</caption>
          <thead>
            <tr>
              <th scope="col">{t.usage.chart.dayColumn}</th>
              <th scope="col">{t.usage.chart.callsColumn}</th>
              <th scope="col">{t.usage.chart.tokensColumn}</th>
            </tr>
          </thead>
          <tbody>
            {daily.map((day) => (
              <tr key={day.date}>
                <th scope="row">{formatDayLong(day.date)}</th>
                <td>{formatInteger(day.calls)}</td>
                <td>{formatInteger(day.tokens)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
