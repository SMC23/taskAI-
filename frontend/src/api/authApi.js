import { apiRequest } from './client.js';

// Contrato: backend/src/routes/auth.js y controllers/authController.js

/** POST /auth/register → 201 { token, user: { id, name, email } } */
export function register({ name, email, password }) {
  return apiRequest('/auth/register', { method: 'POST', body: { name, email, password }, auth: false });
}

/** POST /auth/login → 200 { token, user: { id, name, email } } */
export function login({ email, password }) {
  return apiRequest('/auth/login', { method: 'POST', body: { email, password }, auth: false });
}

/** GET /auth/me → 200 { user: { id, name, email } } (requiere token) */
export function me({ signal } = {}) {
  return apiRequest('/auth/me', { signal });
}
