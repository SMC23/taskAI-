/**
 * Barra de progreso accesible (role="progressbar") con el texto visible al lado.
 * El ancho va en style porque es un valor dinámico: Tailwind solo genera clases
 * que encuentra escritas en el código, no las calculadas en tiempo de ejecución.
 */
export function ProgressBar({ value, label }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-semibold tabular-nums text-slate-900">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${percent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
