import { z } from 'zod';
import { AppError } from '../utils/errors.js';

// trim + minúsculas ANTES de validar, para que " Ana@Mail.com " se guarde como "ana@mail.com"
const emailField = z
  .string({ error: 'El email es obligatorio' })
  .trim()
  .toLowerCase()
  .pipe(z.email('El email no es válido'));

export const registerSchema = z.object({
  name: z
    .string({ error: 'El nombre es obligatorio' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede superar los 50 caracteres'),
  email: emailField,
  password: z
    .string({ error: 'La contraseña es obligatoria' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    // bcrypt solo usa los primeros 72 bytes; más allá se ignorarían en silencio
    .max(72, 'La contraseña no puede superar los 72 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe tener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe tener al menos un número'),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string({ error: 'La contraseña es obligatoria' }).min(1, 'La contraseña es obligatoria'),
});

/**
 * Middleware que valida req.body contra un schema de Zod.
 * Si falla, envía un 400 al errorHandler con los errores en formato legible:
 *   [{ field: 'password', message: 'La contraseña debe tener al menos una mayúscula' }]
 * Si pasa, sustituye req.body por los datos ya limpios (trim, minúsculas) y continúa.
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const err = new AppError('Datos de entrada inválidos', 400, 'VALIDATION_ERROR');
      err.details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      }));
      return next(err);
    }

    req.body = result.data;
    next();
  };
}
