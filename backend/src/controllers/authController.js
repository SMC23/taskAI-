import * as authService from '../services/authService.js';
import * as userModel from '../models/userModel.js';
import { AppError } from '../utils/errors.js';

// Express 5 envía automáticamente al errorHandler los errores de funciones async,
// así que los controllers no necesitan try/catch.

/** POST /api/auth/register → 201 { token, user } */
export async function register(req, res) {
  const { name, email, password } = req.body;
  const { token, user } = await authService.register(name, email, password);
  res.status(201).json({ token, user });
}

/** POST /api/auth/login → 200 { token, user } */
export async function login(req, res) {
  const { email, password } = req.body;
  const { token, user } = await authService.login(email, password);
  res.status(200).json({ token, user });
}

/** GET /api/auth/me → 200 { user } del token actual (para restaurar la sesión en el frontend) */
export async function me(req, res) {
  const user = await userModel.findById(req.userId);
  if (!user) {
    // El token es válido pero el usuario ya no existe (p. ej. cuenta borrada)
    throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
}
