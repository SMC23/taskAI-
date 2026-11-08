import { Link, NavLink } from 'react-router';
import t from '../../i18n/es.js';
import { Button } from '../ui/Button.jsx';

/** Barra superior de las páginas privadas. */
export function AppHeader({ userName, onLogout }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link
          to="/"
          className="rounded text-lg font-bold tracking-tight text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {t.app.name}
        </Link>
        <div className="flex items-center gap-3">
          <NavLink
            to="/usage"
            className={({ isActive }) =>
              `rounded text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${isActive ? 'text-indigo-700 underline underline-offset-4' : 'text-slate-600 hover:text-slate-900'}`
            }
          >
            {t.nav.usage}
          </NavLink>
          <span className="hidden text-sm text-slate-600 sm:inline">{userName}</span>
          <Button variant="secondary" onClick={onLogout}>
            {t.auth.logout}
          </Button>
        </div>
      </div>
    </header>
  );
}
