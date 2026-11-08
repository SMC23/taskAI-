import t from '../../i18n/es.js';
import { LoadingState } from '../ui/LoadingState.jsx';

/** Pantalla de carga mientras se comprueba la sesión (evita mostrar una página y luego otra). */
export function FullPageLoader() {
  return <LoadingState label={t.common.loading} className="min-h-svh bg-slate-50" />;
}
