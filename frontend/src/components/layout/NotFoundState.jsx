import t from '../../i18n/es.js';
import { ButtonLink } from '../ui/ButtonLink.jsx';

/** Recurso inexistente o ajeno: mismo mensaje en los dos casos (no se revela qué existe). */
export function NotFoundState({ title, description }) {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <p className="text-4xl font-bold text-indigo-600" aria-hidden="true">
        404
      </p>
      <h1 className="mt-2 text-xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <ButtonLink to="/" variant="secondary" className="mt-6">
        {t.nav.backToProjects}
      </ButtonLink>
    </div>
  );
}
