import t from '../../i18n/es.js';
import { Button } from '../ui/Button.jsx';

/** Se muestra si no se pudo comprobar la sesión por un fallo de red o del servidor. */
export function ConnectionError({ onRetry }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-50 px-4">
      <div role="alert" className="max-w-md text-center">
        <h1 className="text-lg font-semibold text-slate-900">{t.connection.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{t.connection.description}</p>
        <Button className="mt-6" onClick={onRetry}>
          {t.common.retry}
        </Button>
      </div>
    </main>
  );
}
