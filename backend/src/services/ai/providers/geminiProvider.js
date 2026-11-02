import { GoogleGenAI } from '@google/genai';
import { aiUnavailable, aiRequestFailed, aiTruncated, aiInvalidResponse } from '../errors.js';

export const name = 'gemini';
export const DEFAULT_MODEL = 'gemini-3.8-flash'; // estable y con nivel gratuito
export const API_KEY_ENV = 'GEMINI_API_KEY';

// En Gemini max_output_tokens incluye los tokens de "thinking", por eso hay más
// margen que en Anthropic (2048) para que el razonamiento no corte el JSON.
const MAX_OUTPUT_TOKENS = 8192;

// timeout: sin él, con el modelo saturado una petición llegó a tardar 159 s.
// maxRetries 0: en @google/genai 2.32.0 los reintentos automáticos fallan con
// "TypeError: unusable" (reenvían un body ya consumido) y ocultan el error real.
const REQUEST_OPTIONS = { timeout: 60_000, maxRetries: 0 };

// Reintentos propios solo ante saturación temporal (503 "high demand", 429).
// Un timeout no se reintenta: ya se esperaron 60 s.
let retryDelaysMs = [1_000, 3_000];

/** Permite acortar las esperas entre reintentos en los tests. */
export function setRetryDelaysForTesting(delays) {
  retryDelaysMs = delays;
}

export const getModel = () => process.env.GEMINI_MODEL || DEFAULT_MODEL;

let client;

function getClient() {
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

/** Permite inyectar un cliente falso en los tests. */
export function setClientForTesting(fakeClient) {
  client = fakeClient;
}

/** Extrae el mensaje y el motivo del cuerpo de error de Google (nunca contiene la key). */
function describeGoogleError(err) {
  try {
    const parsed = JSON.parse(err.body);
    const error = (Array.isArray(parsed) ? parsed[0] : parsed)?.error ?? {};
    const reason = error.details?.find((d) => d.reason)?.reason;
    return { message: error.message ?? err.message, reason };
  } catch {
    return { message: err.message, reason: undefined };
  }
}

/**
 * Traduce los errores del SDK de Gemini a los errores comunes de la capa de IA.
 * La API de interactions no exporta sus clases de error, así que se clasifica
 * por código HTTP (`statusCode`). Sin código = error de red o timeout.
 */
function translateError(err, model) {
  const status = err.statusCode ?? err.status;
  const { message, reason } = describeGoogleError(err);
  const meta = { model, auditMessage: `${status ?? 'network'}: ${reason ? `${reason} - ` : ''}${message}`, cause: err };

  // Google responde 400 (no 401) cuando la key es inválida
  const invalidKey = reason === 'API_KEY_INVALID';
  if (!status || invalidKey || status === 401 || status === 403 || status === 429 || status >= 500) {
    return aiUnavailable(meta);
  }
  return aiRequestFailed(meta);
}

async function createWithRetry(params) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await getClient().interactions.create(params, REQUEST_OPTIONS);
    } catch (err) {
      const status = err.statusCode ?? err.status;
      const retryable = status === 503 || status === 429;
      if (!retryable || attempt >= retryDelaysMs.length) throw err;
      await new Promise((resolve) => setTimeout(resolve, retryDelaysMs[attempt]));
    }
  }
}

/** Gemini admite un subconjunto de JSON Schema; la clave "$schema" no forma parte de él. */
function toGeminiSchema(jsonSchema) {
  const { $schema, ...schema } = jsonSchema;
  return schema;
}

/**
 * Contrato común de proveedor.
 * @returns {Promise<{ text: string, usage: { promptTokens: number, completionTokens: number }, model: string }>}
 */
export async function generateStructured({ systemPrompt, userPrompt, jsonSchema }) {
  const model = getModel();

  let interaction;
  try {
    interaction = await createWithRetry({
      model,
      input: userPrompt,
      system_instruction: systemPrompt,
      store: false, // no guardar la conversación en los servidores de Google
      response_format: { type: 'text', mime_type: 'application/json', schema: toGeminiSchema(jsonSchema) },
      generation_config: { max_output_tokens: MAX_OUTPUT_TOKENS },
    });
  } catch (err) {
    throw translateError(err, model);
  }

  // total_output_tokens NO incluye el thinking (verificado: total_tokens = input + output + thought),
  // y el thinking se factura como output, así que se suman en completionTokens
  const usage = {
    promptTokens: interaction.usage?.total_input_tokens ?? 0,
    completionTokens: (interaction.usage?.total_output_tokens ?? 0) + (interaction.usage?.total_thought_tokens ?? 0),
  };

  if (interaction.status === 'incomplete') throw aiTruncated({ usage, model });
  if (interaction.status !== 'completed') {
    // failed, cancelled, budget_exceeded, requires_action...
    throw aiInvalidResponse(`la generación terminó con estado "${interaction.status}"`, { usage, model });
  }

  return { text: interaction.output_text ?? '', usage, model };
}
