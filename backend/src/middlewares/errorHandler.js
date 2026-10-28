import { AppError } from '../utils/errors.js';

/** Responde 404 a cualquier ruta que no exista. */
export function notFound(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` } });
}

/** Middleware final de errores: convierte cualquier error en una respuesta JSON consistente. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // JSON mal formado en el body (lanzado por express.json())
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'El cuerpo de la petición no es JSON válido' } });
  }

  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;

  if (statusCode >= 500) {
    console.error('[error]', err, err.cause ?? '');
  }

  res.status(statusCode).json({
    error: {
      code: isAppError ? err.code : 'INTERNAL_ERROR',
      // En producción no se filtran mensajes de errores inesperados
      message: isAppError || process.env.NODE_ENV !== 'production' ? err.message : 'Error interno del servidor',
      // Lista de errores por campo (p. ej. validación de Zod)
      ...(isAppError && err.details && { details: err.details }),
    },
  });
}
