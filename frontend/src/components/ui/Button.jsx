import { Spinner } from './Spinner.jsx';

const VARIANTS = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-400',
  secondary: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:text-slate-400',
};

/** Botón con estado de carga: se deshabilita y muestra un spinner mientras `loading`. */
export function Button({ type = 'button', variant = 'primary', loading = false, loadingText, className = '', children, ...props }) {
  return (
    <button
      {...props}
      type={type}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    >
      {loading && <Spinner className="size-4" />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
