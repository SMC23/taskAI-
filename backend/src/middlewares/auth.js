import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';

/**
 * Protege una ruta: exige `Authorization: Bearer <token>` válido.
 * Si el token es correcto, deja el id del usuario en `req.userId`.
 */
export function authenticate(req, res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('No token provided', 401, 'NO_TOKEN'));
  }

  try {
    // algorithms fija HS256: impide que un token manipulado elija otro algoritmo (p. ej. "none")
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

    if (!payload.userId) {
      return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
    }

    req.userId = payload.userId;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
    }
    // JsonWebTokenError (firma incorrecta, mal formado...) o NotBeforeError
    next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
  }
}
