/**
 * Campo de formulario accesible: label real, pista opcional y mensaje de error
 * asociados al input con aria-describedby; aria-invalid cuando hay error.
 */
export function TextField({ id, label, error, hint, className = '', ...inputProps }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/30';

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:ring-4 focus:outline-none ${stateClasses}`}
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
