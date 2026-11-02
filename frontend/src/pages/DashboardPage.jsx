import { AppHeader } from '../components/layout/AppHeader.jsx';
import { useAuth } from '../hooks/useAuth.js';
import t from '../i18n/es.js';

/** Página principal (protegida). De momento es un marcador de posición. */
export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-svh bg-slate-50">
      <AppHeader userName={user.name} onLogout={logout} />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">{t.dashboard.greeting(user.name)}</h1>
        <p className="mt-2 text-slate-600">{t.dashboard.comingSoon}</p>
        <p className="mt-1 text-sm text-slate-500">{t.dashboard.description}</p>
      </main>
    </div>
  );
}
