import { useAuth } from '../../hooks/useAuth.js';
import { AppHeader } from './AppHeader.jsx';

/** Marco de las páginas privadas: cabecera con la sesión + contenido centrado. */
export function AppLayout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-svh bg-slate-50">
      <AppHeader userName={user.name} onLogout={logout} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">{children}</main>
    </div>
  );
}
