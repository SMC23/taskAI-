import { AppError } from '../utils/errors.js';

/** Convierte los issues de Zod en una lista legible: [{ field, message }] */
export function formatZodIssues(issues) {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));
}

/**
 * Middleware que valida req.body contra un schema de Zod.
 * Si falla, envía un 400 al errorHandler con los errores en formato legible.
 * Si pasa, sustituye req.body por los datos ya limpios (trim, minúsculas) y continúa.
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const err = new AppError('Datos de entrada inválidos', 400, 'VALIDATION_ERROR');
      err.details = formatZodIssues(result.error.issues);
      return next(err);
    }

    req.body = result.data;
    next();
  };
}
