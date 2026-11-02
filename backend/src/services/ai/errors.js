import { AppError } from '../../utils/errors.js';

/**
 * Errores comunes de la capa de IA. Los proveedores traducen los errores de su
 * SDK a estos, para que taskGenerator nunca vea errores específicos de un proveedor.
 *
 * Además del AppError normal, cada error puede llevar datos para la auditoría:
 *   - usage:        tokens consumidos (si la API llegó a responder, esa llamada se paga)
 *   - model:        modelo que se usó
 *   - auditMessage: detalle técnico para ai_audit_log (al usuario solo le llega `message`)
 */
export class AiError extends AppError {
  constructor(message, statusCode, code, { usage = null, model = null, auditMessage = null, cause } = {}) {
    super(message, statusCode, code, cause);
    this.name = 'AiError';
    this.usage = usage;
    this.model = model;
    this.auditMessage = auditMessage ?? message;
  }
}

/** Autenticación, cuota, rate limit, red o servicio caído → 503 */
export const aiUnavailable = (meta) =>
  new AiError('El servicio de IA no está disponible en este momento, inténtalo más tarde', 503, 'AI_UNAVAILABLE', meta);

/** La API rechazó la petición por otro motivo (p. ej. schema demasiado complejo) → 502 */
export const aiRequestFailed = (meta) => new AiError('El servicio de IA devolvió un error', 502, 'AI_ERROR', meta);

/** La respuesta llegó pero no se puede usar → 502 */
export const aiInvalidResponse = (reason, meta) =>
  new AiError(`La IA devolvió una respuesta inválida: ${reason}`, 502, 'AI_INVALID_RESPONSE', meta);

/** La respuesta se cortó por el límite de tokens */
export const aiTruncated = (meta) => aiInvalidResponse('la respuesta se cortó por exceder el límite de tokens', meta);

/** El modelo se negó a responder (filtros de seguridad) */
export const aiRefused = (meta) => aiInvalidResponse('la IA rechazó procesar esta descripción', meta);
