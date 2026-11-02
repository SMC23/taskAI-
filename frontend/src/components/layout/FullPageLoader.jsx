import t from '../../i18n/es.js';
import { Spinner } from '../ui/Spinner.jsx';

/** Pantalla de carga mientras se comprueba la sesión (evita mostrar una página y luego otra). */
export function FullPageLoader() {
  return (
    <div role="status" className="flex min-h-svh items-center justify-center bg-slate-50 text-indigo-600">
      <Spinner className="size-8" />
      <span className="sr-only">{t.common.loading}</span>
    </div>
  );
}
