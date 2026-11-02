import { Navigate, Outlet, useLocation } from 'react-router';
import { FullPageLoader } from '../components/layout/FullPageLoader.jsx';
import { useAuth } from '../hooks/useAuth.js';

/**
 * Páginas para usuarios sin sesión (login, registro). Con sesión redirige a la
 * página que se quería visitar o al inicio. Tras un login/registro correcto
 * también es esta ruta la que hace la redirección.
 */
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to={location.state?.from ?? '/'} replace />;

  return <Outlet />;
}
