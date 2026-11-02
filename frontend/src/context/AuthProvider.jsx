import { useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/authApi.js';
import { setUnauthorizedHandler } from '../api/client.js';
import { tokenStorage } from '../utils/tokenStorage.js';
import { AuthContext } from './authContext.js';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStorage.get());
  const [user, setUser] = useState(null);
  // Si hay un token guardado, hay que comprobarlo antes de decidir qué pantalla mostrar
  const [loading, setLoading] = useState(() => Boolean(tokenStorage.get()));
  const [connectionError, setConnectionError] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [verifyAttempt, setVerifyAttempt] = useState(0);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const startSession = useCallback(({ token: newToken, user: newUser }) => {
    tokenStorage.set(newToken);
    setToken(newToken);
    setUser(newUser);
    setSessionExpired(false);
    setConnectionError(false);
  }, []);

  // Cualquier 401 de una petición autenticada (token caducado, manipulado...) cierra la sesión.
  // Las rutas protegidas reaccionan a user = null y llevan al login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      setSessionExpired(true);
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Al cargar la app (o al reintentar), comprueba con /auth/me que el token guardado sigue siendo válido
  useEffect(() => {
    if (!tokenStorage.get()) return undefined;

    const controller = new AbortController();
    authApi
      .me({ signal: controller.signal })
      .then(({ user: currentUser }) => {
        setUser(currentUser);
        setConnectionError(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        // El 401 ya lo gestionó el handler; otros fallos (servidor caído, red) no borran el token
        if (err.status !== 401) setConnectionError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    // En desarrollo StrictMode monta el efecto dos veces: se cancela la primera petición
    return () => controller.abort();
  }, [verifyAttempt]);

  const retrySession = useCallback(() => {
    setConnectionError(false);
    setLoading(true);
    setVerifyAttempt((attempt) => attempt + 1);
  }, []);

  const login = useCallback(
    async (email, password) => startSession(await authApi.login({ email, password })),
    [startSession],
  );

  const register = useCallback(
    async (name, email, password) => startSession(await authApi.register({ name, email, password })),
    [startSession],
  );

  const logout = useCallback(() => {
    clearSession();
    setSessionExpired(false);
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, token, loading, connectionError, sessionExpired, login, register, logout, retrySession }),
    [user, token, loading, connectionError, sessionExpired, login, register, logout, retrySession],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
