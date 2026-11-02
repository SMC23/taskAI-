import rateLimit from 'express-rate-limit';

const rateLimitMessage = (message) => ({ error: { code: 'RATE_LIMITED', message } });

const common = { standardHeaders: 'draft-8', legacyHeaders: false };

/** Límite general para toda la API. */
export const globalLimiter = rateLimit({
  ...common,
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX) || 100,
  message: rateLimitMessage('Demasiadas peticiones, inténtalo más tarde'),
});

/** Contra fuerza bruta: 20 intentos de login/registro por IP cada 15 min. */
export const authLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: rateLimitMessage('Demasiados intentos, inténtalo en 15 minutos'),
});

/**
 * Límite estricto para los endpoints que llaman a la IA: 10 peticiones por hora
 * por IP. Cada llamada cuesta dinero.
 */
export const aiLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: rateLimitMessage('Has alcanzado el límite de 10 generaciones con IA por hora'),
});
