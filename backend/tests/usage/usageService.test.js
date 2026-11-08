import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/models/aiAuditModel.js', () => ({ getUsageSummary: vi.fn() }));

const aiAuditModel = await import('../../src/models/aiAuditModel.js');
const { getSummary } = await import('../../src/services/usageService.js');
const { classifyAuditError, aiInvalidResponse, aiTruncated } = await import('../../src/services/ai/errors.js');

describe('classifyAuditError', () => {
  it.each([
    ['503: UNAVAILABLE - The model is overloaded', 'unavailable'],
    ['429: Too many requests', 'unavailable'],
    ['401: invalid x-api-key', 'unavailable'],
    ['403: forbidden', 'unavailable'],
    ['500: internal', 'unavailable'],
    ['400: API_KEY_INVALID - API key not valid', 'unavailable'],
    ['network: fetch failed', 'unavailable'],
    ['400: schema too complex', 'request_failed'],
    ['404: model not found', 'request_failed'],
    ['Cannot read properties of undefined', 'unknown'],
    ['', 'unknown'],
    [null, 'unknown'],
  ])('%s → %s', (message, expected) => {
    expect(classifyAuditError(message)).toBe(expected);
  });

  it('reconoce los mensajes reales de respuesta inválida', () => {
    expect(classifyAuditError(aiInvalidResponse('no es JSON válido').auditMessage)).toBe('invalid_response');
    expect(classifyAuditError(aiTruncated().auditMessage)).toBe('invalid_response');
  });
});

describe('usageService.getSummary', () => {
  const call = (overrides) => ({ id: 'x', created_at: new Date(), provider: 'gemini', model: 'm', total_tokens: 0, latency_ms: 1, ...overrides });

  beforeEach(() => {
    aiAuditModel.getUsageSummary.mockResolvedValue({
      totals: { calls: 2, avg_latency_ms: 1, p95_latency_ms: 1 },
      daily: [],
      byModel: [],
      recentCalls: [
        call({ status: 'error', error_message: '503: UNAVAILABLE - detalle técnico secreto' }),
        call({ status: 'error', error_message: null }),
        call({ status: 'success', error_message: null }),
      ],
    });
  });

  it('nunca devuelve error_message; solo el tipo genérico', async () => {
    const { recent_calls: calls } = await getSummary('user-1', 7);

    expect(calls.map((c) => c.error_type)).toEqual(['unavailable', 'unknown', null]);
    expect(calls.every((c) => !('error_message' in c))).toBe(true);
    expect(JSON.stringify(calls)).not.toContain('detalle técnico');
  });
});
