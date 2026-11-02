import t from '../i18n/es.js';
import { tokenStorage } from '../utils/tokenStorage.js';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

if (!API_URL) {
  throw new Error('Falta VITE_API_URL. Copia frontend/.env.example como frontend/.env');
}

/** Error de la API con un mensaje legible y los errores por campo del backend. */
export class ApiError extends Error {
  constructor({ status, code, message, details = [] }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** { campo: mensaje } con el primer error de cada campo (array details del backend). */
  get fieldErrors() {
    const errors = {};
    for (const { field, message } of this.details) {
      if (field && field !== 'body' && !errors[field]) errors[field] = message;
    }
    return errors;
  }
}

// Lo registra AuthProvider: cierra la sesión cuando el backend rechaza el token.
let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function parseBody(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  if (!isJson) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Cliente central de la API.
 * @param {string} path ruta relativa a VITE_API_URL, p. ej. '/auth/me'
 * @param {{ method?: string, body?: unknown, auth?: boolean, signal?: AbortSignal }} options
 *   auth=false no envía el token (login y registro).
 */
export async function apiRequest(path, { method = 'GET', body, auth = true, signal } = {}) {
  const token = auth ? tokenStorage.get() : null;
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError({ status: 0, code: 'NETWORK_ERROR', message: t.errors.NETWORK_ERROR });
  }

  const data = await parseBody(response);
  if (response.ok) return data;

  // Formato de error del backend: { error: { code, message, details? } }
  const error = data?.error ?? {};
  const code = error.code ?? `HTTP_${response.status}`;

  // Solo se cierra la sesión si la petición iba autenticada: un 401 del login
  // (credenciales incorrectas) no debe expulsar a nadie.
  if (response.status === 401 && token) onUnauthorized?.(code);

  throw new ApiError({
    status: response.status,
    code,
    message: t.errors[code] ?? error.message ?? t.errors.UNKNOWN,
    details: Array.isArray(error.details) ? error.details : [],
  });
}
