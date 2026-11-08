import { AppError } from '../utils/errors.js';

/** Convierte los issues de Zod en una lista legible: [{ field, message }] */
export function formatZodIssues(issues) {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));
}

/**
 * Middleware que valida req.body (o req.params / req.query con source) contra un schema de Zod.
 * Si falla, envía un 400 al errorHandler con los errores en formato legible.
 * Si pasa, sustituye los datos por los ya limpios (trim, minúsculas) y continúa.
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {});

    if (!result.success) {
      const err = new AppError('Datos de entrada inválidos', 400, 'VALIDATION_ERROR');
      err.details = formatZodIssues(result.error.issues);
      return next(err);
    }

    // En Express 5 req.query es un getter sin setter: asignarlo lanzaría un TypeError
    Object.defineProperty(req, source, { value: result.data, writable: true, configurable: true, enumerable: true });
    next();
  };
}
