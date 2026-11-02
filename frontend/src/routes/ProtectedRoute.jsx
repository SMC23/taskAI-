import { Navigate, Outlet, useLocation } from 'react-router';
import { ConnectionError } from '../components/layout/ConnectionError.jsx';
import { FullPageLoader } from '../components/layout/FullPageLoader.jsx';
import { useAuth } from '../hooks/useAuth.js';

/**
 * Solo deja pasar con sesión. Mientras se comprueba el token muestra un loader
 * (nunca la página privada ni el login antes de saber la respuesta).
 */
export function ProtectedRoute() {
  const { user, loading, connectionError, retrySession } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (connectionError) return <ConnectionError onRetry={retrySession} />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <Outlet />;
}
