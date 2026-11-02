import { use } from 'react';
import { AuthContext } from '../context/authContext.js';

/** Acceso a la sesión. Debe usarse dentro de <AuthProvider>. */
export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}
