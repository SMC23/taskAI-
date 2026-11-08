import { useCallback, useEffect, useState } from 'react';

/**
 * Carga datos de la API para una clave (p. ej. el id del proyecto) y los mantiene en estado.
 * - load(key, signal) debe ser una función estable (definida fuera del componente).
 * - Si cambia la clave, se cancela la petición anterior y se vuelve a cargar.
 * - reload() reintenta; setData() permite actualizar los datos en local (p. ej. tras un PATCH).
 */
export function useResource(load, key) {
  // `key` guarda a qué clave pertenecen los datos: si no coincide con la actual, se está cargando
  const [state, setState] = useState({ key: null, data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    load(key, controller.signal)
      .then((data) => setState({ key, data, error: null }))
      .catch((error) => {
        if (!controller.signal.aborted) setState({ key, data: null, error });
      });
    return () => controller.abort();
  }, [load, key, attempt]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, key: null }));
    setAttempt((n) => n + 1);
  }, []);

  const setData = useCallback((updater) => {
    setState((prev) => ({ ...prev, data: typeof updater === 'function' ? updater(prev.data) : updater }));
  }, []);

  const loading = state.key !== key;
  // staleData: los últimos datos válidos mientras llegan los nuevos (para no vaciar la pantalla)
  return { data: loading ? null : state.data, staleData: loading ? state.data : null, error: loading ? null : state.error, loading, reload, setData };
}
