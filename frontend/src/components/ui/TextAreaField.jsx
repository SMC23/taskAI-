/**
 * Área de texto accesible con contador de caracteres. El contador y la pista se
 * asocian al campo con aria-describedby; el contador se marca en rojo al pasarse.
 */
export function TextAreaField({ id, label, error, hint, maxLength, counterText, value, className = '', ...props }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const counterId = maxLength ? `${id}-counter` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, counterId, errorId].filter(Boolean).join(' ') || undefined;
  const overLimit = maxLength && value.length > maxLength;

  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/30';

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:ring-4 focus:outline-none disabled:bg-slate-50 ${stateClasses}`}
        {...props}
      />
      <div className="mt-1 flex flex-wrap justify-between gap-x-4 text-xs">
        {hint && (
          <p id={hintId} className="text-slate-500">
            {hint}
          </p>
        )}
        {maxLength && (
          <p id={counterId} className={`ml-auto tabular-nums ${overLimit ? 'font-semibold text-red-600' : 'text-slate-500'}`}>
            {counterText}
          </p>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
