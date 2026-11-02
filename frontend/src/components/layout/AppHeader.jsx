import t from '../../i18n/es.js';
import { Button } from '../ui/Button.jsx';

/** Barra superior de las páginas privadas. */
export function AppHeader({ userName, onLogout }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <span className="text-lg font-bold tracking-tight text-indigo-600">{t.app.name}</span>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 sm:inline">{userName}</span>
          <Button variant="secondary" onClick={onLogout}>
            {t.auth.logout}
          </Button>
        </div>
      </div>
    </header>
  );
}
