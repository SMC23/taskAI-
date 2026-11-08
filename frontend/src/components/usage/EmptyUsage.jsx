import t from '../../i18n/es.js';
import { ButtonLink } from '../ui/ButtonLink.jsx';

/** Estado vacío del panel: no hay llamadas a la IA en el periodo elegido. */
export function EmptyUsage({ days }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <svg className="mx-auto size-12 text-indigo-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 20h16M7 16v-4M12 16V8M17 16v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{t.usage.empty.title(days)}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">{t.usage.empty.description}</p>
      <ButtonLink to="/projects/new" className="mt-6">
        {t.usage.empty.action}
      </ButtonLink>
    </div>
  );
}
