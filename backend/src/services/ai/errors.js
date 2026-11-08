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

const INVALID_RESPONSE_PREFIX = 'La IA devolvió una respuesta inválida';

/**
 * Tipo genérico de un error de ai_audit_log, para mostrarlo al usuario sin exponer el detalle técnico.
 * La tabla solo guarda el texto, así que se deduce de los formatos de auditMessage que generan
 * este archivo y los proveedores: "<http|network>: detalle" o el prefijo de respuesta inválida.
 * @returns {'unavailable'|'invalid_response'|'request_failed'|'unknown'}
 */
export function classifyAuditError(message) {
  if (!message) return 'unknown';
  if (message.startsWith(INVALID_RESPONSE_PREFIX)) return 'invalid_response';
  if (message.startsWith('network:')) return 'unavailable';

  const status = Number(message.match(/^(\d{3}):/)?.[1]);
  if (!status) return 'unknown';
  // Mismos criterios que translateError en los proveedores (Google da 400 si la key es inválida)
  const unavailable = status === 401 || status === 403 || status === 429 || status >= 500 || message.includes('API_KEY_INVALID');
  return unavailable ? 'unavailable' : 'request_failed';
}

/** Autenticación, cuota, rate limit, red o servicio caído → 503 */
export const aiUnavailable = (meta) =>
  new AiError('El servicio de IA no está disponible en este momento, inténtalo más tarde', 503, 'AI_UNAVAILABLE', meta);

/** La API rechazó la petición por otro motivo (p. ej. schema demasiado complejo) → 502 */
export const aiRequestFailed = (meta) => new AiError('El servicio de IA devolvió un error', 502, 'AI_ERROR', meta);

/** La respuesta llegó pero no se puede usar → 502 */
export const aiInvalidResponse = (reason, meta) =>
  new AiError(`${INVALID_RESPONSE_PREFIX}: ${reason}`, 502, 'AI_INVALID_RESPONSE', meta);

/** La respuesta se cortó por el límite de tokens */
export const aiTruncated = (meta) => aiInvalidResponse('la respuesta se cortó por exceder el límite de tokens', meta);

/** El modelo se negó a responder (filtros de seguridad) */
export const aiRefused = (meta) => aiInvalidResponse('la IA rechazó procesar esta descripción', meta);
