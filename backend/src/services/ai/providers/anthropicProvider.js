import Anthropic from '@anthropic-ai/sdk';
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema';
import { aiUnavailable, aiRequestFailed, aiTruncated, aiRefused } from '../errors.js';

export const name = 'anthropic';
export const DEFAULT_MODEL = 'claude-sonnet-4-6';
export const API_KEY_ENV = 'ANTHROPIC_API_KEY';

const MAX_TOKENS = 2048;

export const getModel = () => process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

let client;

function getClient() {
  client ??= new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: 60_000, // 60 s por intento
    maxRetries: 2, // el SDK reintenta solo 429, 5xx y errores de red
  });
  return client;
}

/** Permite inyectar un cliente falso en los tests. */
export function setClientForTesting(fakeClient) {
  client = fakeClient;
}

/** Traduce los errores del SDK de Anthropic a los errores comunes de la capa de IA. */
function translateError(err, model) {
  const auditMessage = err instanceof Anthropic.APIError ? `${err.status ?? 'network'}: ${err.message}` : err.message;
  const meta = { model, auditMessage, cause: err };

  if (
    err instanceof Anthropic.AuthenticationError || // key inválida
    err instanceof Anthropic.PermissionDeniedError ||
    err instanceof Anthropic.RateLimitError || // cuota / rate limit
    err instanceof Anthropic.InternalServerError || // servicio caído o saturado
    err instanceof Anthropic.APIConnectionError // red o timeout
  ) {
    return aiUnavailable(meta);
  }
  return aiRequestFailed(meta);
}

/**
 * Contrato común de proveedor.
 * @returns {Promise<{ text: string, usage: { promptTokens: number, completionTokens: number }, model: string }>}
 */
export async function generateStructured({ systemPrompt, userPrompt, jsonSchema }) {
  const model = getModel();

  let response;
  try {
    response = await getClient().messages.create({
      model,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      // Structured outputs: el helper adapta el JSON Schema a lo que admite la API
      output_config: { format: jsonSchemaOutputFormat(jsonSchema) },
    });
  } catch (err) {
    throw translateError(err, model);
  }

  const usage = {
    promptTokens: response.usage?.input_tokens ?? 0,
    completionTokens: response.usage?.output_tokens ?? 0,
  };

  if (response.stop_reason === 'max_tokens') throw aiTruncated({ usage, model });
  if (response.stop_reason === 'refusal') throw aiRefused({ usage, model });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  return { text, usage, model };
}
