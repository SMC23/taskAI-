import t from '../../i18n/es.js';
import { ErrorState } from '../ui/ErrorState.jsx';

/** Se muestra si no se pudo comprobar la sesión por un fallo de red o del servidor. */
export function ConnectionError({ onRetry }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-50 px-4">
      <ErrorState title={t.connection.title} description={t.connection.description} onRetry={onRetry} />
    </main>
  );
}
