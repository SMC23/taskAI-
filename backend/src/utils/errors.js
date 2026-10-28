/**
 * Error de aplicación con código HTTP. Los modelos y servicios lanzan AppError
 * y el middleware de errores lo convierte en una respuesta JSON.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', cause) {
    super(message, { cause });
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Códigos de error de PostgreSQL más habituales
// https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_ERRORS = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
  INVALID_TEXT_REPRESENTATION: '22P02', // p. ej. UUID o enum con formato inválido
};

/**
 * Traduce un error de `pg` a un AppError con contexto. Nunca expone el SQL ni
 * detalles internos al cliente; el error original queda en `cause` para los logs.
 */
export function toDbError(err, context) {
  if (err instanceof AppError) return err;

  switch (err.code) {
    case PG_ERRORS.UNIQUE_VIOLATION:
      return new AppError(`${context}: el registro ya existe`, 409, 'CONFLICT', err);
    case PG_ERRORS.FOREIGN_KEY_VIOLATION:
      return new AppError(`${context}: referencia a un registro inexistente`, 400, 'INVALID_REFERENCE', err);
    case PG_ERRORS.NOT_NULL_VIOLATION:
    case PG_ERRORS.CHECK_VIOLATION:
    case PG_ERRORS.INVALID_TEXT_REPRESENTATION:
      return new AppError(`${context}: datos inválidos`, 400, 'INVALID_DATA', err);
    default:
      return new AppError(`${context}: error de base de datos`, 500, 'DATABASE_ERROR', err);
  }
}

/** true si el error es un UUID/enum mal formado; útil para devolver null en lugar de fallar. */
export function isInvalidInput(err) {
  return err?.code === PG_ERRORS.INVALID_TEXT_REPRESENTATION;
}
