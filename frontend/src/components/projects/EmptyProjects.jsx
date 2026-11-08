import t from '../../i18n/es.js';
import { ButtonLink } from '../ui/ButtonLink.jsx';

/** Estado vacío del dashboard: invita a crear el primer proyecto. */
export function EmptyProjects() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <svg className="mx-auto size-12 text-indigo-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 5h10M9 12h10M9 19h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 5l1 1 2-2M4 12l1 1 2-2M4 19l1 1 2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{t.dashboard.empty.title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">{t.dashboard.empty.description}</p>
      <ButtonLink to="/projects/new" className="mt-6">
        {t.dashboard.empty.action}
      </ButtonLink>
    </div>
  );
}
