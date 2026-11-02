import { createContext } from 'react';

/**
 * Sesión del usuario: { user, token, loading, connectionError, sessionExpired,
 * login, register, logout, retrySession }. El valor lo da AuthProvider.
 */
export const AuthContext = createContext(null);
