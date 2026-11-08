import { Spinner } from './Spinner.jsx';

/** Indicador de carga con texto para lectores de pantalla (y visible si se pide). */
export function LoadingState({ label, showLabel = false, className = 'py-16' }) {
  return (
    <div role="status" className={`flex flex-col items-center justify-center gap-3 text-indigo-600 ${className}`}>
      <Spinner className="size-8" />
      <span className={showLabel ? 'text-sm text-slate-600' : 'sr-only'}>{label}</span>
    </div>
  );
}
