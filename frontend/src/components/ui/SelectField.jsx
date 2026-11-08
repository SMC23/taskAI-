/**
 * Desplegable accesible. Con hideLabel el label queda solo para lectores de pantalla
 * (útil en listas, donde el contexto visual ya dice qué se cambia).
 */
export function SelectField({ id, label, hideLabel = false, options, className = '', ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'block text-sm font-medium text-slate-700'}>
        {label}
      </label>
      <select
        id={id}
        className={`${hideLabel ? '' : 'mt-1'} block w-full rounded-lg border border-slate-300 bg-white py-1.5 pr-8 pl-3 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/30 focus:outline-none disabled:cursor-wait disabled:bg-slate-50`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
