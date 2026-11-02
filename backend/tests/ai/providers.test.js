import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';

vi.mock('../../src/models/aiAuditModel.js', () => ({ create: vi.fn().mockResolvedValue({}) }));

const aiAuditModel = await import('../../src/models/aiAuditModel.js');
const { generate } = await import('../../src/services/ai/taskGenerator.js');
const factory = await import('../../src/services/ai/providers/index.js');
const anthropicProvider = await import('../../src/services/ai/providers/anthropicProvider.js');
const geminiProvider = await import('../../src/services/ai/providers/geminiProvider.js');
const { estimateCostUsd } = await import('../../src/services/ai/pricing.js');

const VALID_JSON = JSON.stringify({
  tasks: [
    { title: 'Definir el alcance', description: 'Elegir los proyectos a mostrar.', priority: 'high' },
    { title: 'Diseñar el sitio', description: 'Crear los wireframes principales.', priority: 'medium' },
    { title: 'Publicar el sitio', description: 'Desplegar en un hosting gratuito.', priority: 'low' },
  ],
});

const INPUT = { title: 'Portafolio', description: 'Crear mi portafolio web profesional.', userId: 'u-1', projectId: 'p-1' };

// Clientes falsos con la forma de respuesta de cada SDK
const fakeAnthropicClient = (response) => ({ messages: { create: vi.fn(async () => response) } });
const fakeGeminiClient = (interaction) => ({ interactions: { create: vi.fn(async () => interaction) } });

const anthropicOk = { stop_reason: 'end_turn', usage: { input_tokens: 500, output_tokens: 700 }, content: [{ type: 'text', text: VALID_JSON }] };
const geminiOk = {
  status: 'completed',
  output_text: VALID_JSON,
  usage: { total_input_tokens: 450, total_output_tokens: 300, total_thought_tokens: 200 },
};

const ENV_KEYS = ['AI_PROVIDER', 'GEMINI_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_MODEL', 'ANTHROPIC_MODEL', 'GEMINI_TIER'];
let savedEnv;

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
  aiAuditModel.create.mockClear();
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
});

describe('fábrica de proveedores', () => {
  it('cambiar AI_PROVIDER cambia el proveedor sin tocar taskGenerator', async () => {
    const anthropicClient = fakeAnthropicClient(anthropicOk);
    const geminiClient = fakeGeminiClient(geminiOk);
    anthropicProvider.setClientForTesting(anthropicClient);
    geminiProvider.setClientForTesting(geminiClient);

    process.env.AI_PROVIDER = 'anthropic';
    await generate(INPUT);
    expect(anthropicClient.messages.create).toHaveBeenCalledTimes(1);
    expect(geminiClient.interactions.create).not.toHaveBeenCalled();
    expect(aiAuditModel.create.mock.calls.at(-1)[0]).toMatchObject({
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      promptTokens: 500,
      completionTokens: 700,
      estimatedCostUsd: 0.012, // 500*3/1M + 700*15/1M
    });

    process.env.AI_PROVIDER = 'gemini';
    await generate(INPUT);
    expect(geminiClient.interactions.create).toHaveBeenCalledTimes(1);
    expect(anthropicClient.messages.create).toHaveBeenCalledTimes(1); // no se volvió a llamar
    expect(aiAuditModel.create.mock.calls.at(-1)[0]).toMatchObject({
      provider: 'gemini',
      model: 'gemini-3.8-flash',
      promptTokens: 450,
      completionTokens: 500, // output 300 + thinking 200 (el thinking se factura como output)
      estimatedCostUsd: 0, // nivel gratuito
    });
  });

  it('sin AI_PROVIDER usa gemini por defecto', () => {
    expect(factory.getProvider().name).toBe('gemini');
  });

  it('validateAiConfig rechaza un proveedor inválido o una key ausente, sin mostrar keys', () => {
    process.env.AI_PROVIDER = 'openai';
    expect(() => factory.validateAiConfig()).toThrow('AI_PROVIDER="openai" no es válido');

    process.env.AI_PROVIDER = 'gemini';
    expect(() => factory.validateAiConfig()).toThrow('requiere la variable GEMINI_API_KEY');

    process.env.GEMINI_API_KEY = 'secreto-que-no-debe-aparecer';
    process.env.GEMINI_TIER = 'premium';
    expect(() => factory.validateAiConfig()).toThrow(/GEMINI_TIER="premium"/);

    delete process.env.GEMINI_TIER;
    expect(factory.validateAiConfig()).toEqual({ provider: 'gemini', model: 'gemini-3.8-flash' });
  });
});

describe('Gemini: petición y errores', () => {
  beforeEach(() => {
    process.env.AI_PROVIDER = 'gemini';
    geminiProvider.setRetryDelaysForTesting([1, 1]);
  });

  const httpError = (status) => Object.assign(new Error(`HTTP ${status}`), { statusCode: status, body: '' });

  it('pasa timeout de 60 s y desactiva los reintentos del SDK', async () => {
    const client = fakeGeminiClient(geminiOk);
    geminiProvider.setClientForTesting(client);
    await generate(INPUT);
    expect(client.interactions.create.mock.calls[0][1]).toEqual({ timeout: 60_000, maxRetries: 0 });
  });

  it('503 "high demand" se reintenta y, si luego responde, funciona', async () => {
    const create = vi.fn().mockRejectedValueOnce(httpError(503)).mockResolvedValueOnce(geminiOk);
    geminiProvider.setClientForTesting({ interactions: { create } });
    await expect(generate(INPUT)).resolves.toHaveLength(3);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('503 persistente: 3 intentos en total y luego 503 AI_UNAVAILABLE', async () => {
    const create = vi.fn().mockRejectedValue(httpError(503));
    geminiProvider.setClientForTesting({ interactions: { create } });
    await expect(generate(INPUT)).rejects.toMatchObject({ statusCode: 503, code: 'AI_UNAVAILABLE' });
    expect(create).toHaveBeenCalledTimes(3);
  });

  it('un 400 o un timeout no se reintentan', async () => {
    for (const err of [httpError(400), Object.assign(new Error('Request timed out'), { name: 'APIConnectionTimeoutError' })]) {
      const create = vi.fn().mockRejectedValue(err);
      geminiProvider.setClientForTesting({ interactions: { create } });
      await generate(INPUT).catch(() => {});
      expect(create).toHaveBeenCalledTimes(1);
    }
  });

  it('envía system_instruction, el schema sin $schema y store: false', async () => {
    const client = fakeGeminiClient(geminiOk);
    geminiProvider.setClientForTesting(client);
    await generate(INPUT);

    const params = client.interactions.create.mock.calls[0][0];
    expect(params.model).toBe('gemini-3.8-flash');
    expect(params.system_instruction).toContain('project manager');
    expect(params.store).toBe(false);
    expect(params.response_format).toMatchObject({ type: 'text', mime_type: 'application/json' });
    expect(params.response_format.schema).not.toHaveProperty('$schema');
    expect(params.response_format.schema.properties.tasks.minItems).toBe(3);
  });

  it('status "incomplete" → error de respuesta cortada', async () => {
    geminiProvider.setClientForTesting(fakeGeminiClient({ ...geminiOk, status: 'incomplete', output_text: '{"tasks": [' }));
    await expect(generate(INPUT)).rejects.toMatchObject({ code: 'AI_INVALID_RESPONSE', message: expect.stringContaining('límite de tokens') });
  });

  it('key inválida (Google responde 400 API_KEY_INVALID) → 503 AI_UNAVAILABLE', async () => {
    const err = Object.assign(new Error('400 API error occurred'), {
      statusCode: 400,
      body: JSON.stringify([{ error: { code: 400, message: 'API key not valid.', details: [{ reason: 'API_KEY_INVALID' }] } }]),
    });
    geminiProvider.setClientForTesting({ interactions: { create: vi.fn().mockRejectedValue(err) } });

    await expect(generate(INPUT)).rejects.toMatchObject({ statusCode: 503, code: 'AI_UNAVAILABLE' });
    expect(aiAuditModel.create.mock.calls.at(-1)[0].errorMessage).toBe('400: API_KEY_INVALID - API key not valid.');
  });

  it.each([
    [429, 503, 'AI_UNAVAILABLE'], // cuota agotada
    [500, 503, 'AI_UNAVAILABLE'], // servicio caído
    [undefined, 503, 'AI_UNAVAILABLE'], // red / timeout
    [400, 502, 'AI_ERROR'], // otra petición inválida (p. ej. schema demasiado complejo)
  ])('HTTP %s → %s %s', async (status, expectedStatus, expectedCode) => {
    const err = Object.assign(new Error('fallo'), { statusCode: status, body: '' });
    geminiProvider.setClientForTesting({ interactions: { create: vi.fn().mockRejectedValue(err) } });
    await expect(generate(INPUT)).rejects.toMatchObject({ statusCode: expectedStatus, code: expectedCode });
  });
});

describe('Anthropic: errores', () => {
  beforeEach(() => {
    process.env.AI_PROVIDER = 'anthropic';
  });

  it('AuthenticationError → 503 AI_UNAVAILABLE', async () => {
    const err = new Anthropic.AuthenticationError(401, { type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } }, undefined, new Headers());
    anthropicProvider.setClientForTesting({ messages: { create: vi.fn().mockRejectedValue(err) } });
    await expect(generate(INPUT)).rejects.toMatchObject({ statusCode: 503, code: 'AI_UNAVAILABLE' });
  });

  it('stop_reason max_tokens → error de respuesta cortada, con los tokens auditados', async () => {
    anthropicProvider.setClientForTesting(fakeAnthropicClient({ ...anthropicOk, stop_reason: 'max_tokens', usage: { input_tokens: 500, output_tokens: 2048 } }));
    await expect(generate(INPUT)).rejects.toMatchObject({ message: expect.stringContaining('límite de tokens') });
    expect(aiAuditModel.create.mock.calls.at(-1)[0]).toMatchObject({ completionTokens: 2048, status: 'error' });
  });
});

describe('pricing', () => {
  it('modelo sin precio → null y una sola advertencia', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(estimateCostUsd('gemini', 'modelo-inventado', 100, 100)).toBeNull();
    expect(estimateCostUsd('gemini', 'modelo-inventado', 100, 100)).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('Gemini de pago usa el precio vigente según la fecha', () => {
    process.env.GEMINI_TIER = 'paid';
    expect(estimateCostUsd('gemini', 'gemini-3.8-flash', 1_000_000, 1_000_000)).toBe(4.5); // 0.75 + 3.75 (hasta 2026-12-31)
  });
});
