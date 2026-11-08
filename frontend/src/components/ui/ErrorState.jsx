import t from '../../i18n/es.js';
import { Button } from './Button.jsx';

/** Bloque de error con botón Reintentar (carga fallida, servidor caído…). */
export function ErrorState({ title, description, onRetry }) {
  return (
    <div role="alert" className="mx-auto max-w-md py-12 text-center">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
      {onRetry && (
        <Button className="mt-6" onClick={onRetry}>
          {t.common.retry}
        </Button>
      )}
    </div>
  );
}
