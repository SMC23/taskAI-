/**
 * Precios en USD por millón de tokens de TEXTO (input / output), por proveedor y modelo.
 *
 * Fuentes:
 *   - Anthropic: tabla de modelos de la referencia oficial del SDK (actualizada 2026-10-06).
 *                Página oficial: https://platform.claude.com/docs/en/about-claude/pricing
 *   - Gemini:    https://ai.google.dev/gemini-api/docs/pricing (consultada 2026-11-01)
 *
 * Si un modelo no está aquí, el coste es null (nunca se inventa un precio).
 * Para añadir un modelo, copia su precio de la página oficial.
 */

const PRICING = {
  anthropic: {
    'claude-sonnet-4-6': { input: 3.0, output: 15.0 },
    'claude-sonnet-5-5': { input: 2.0, output: 10.0 },
    'claude-opus-5-5': { input: 4.0, output: 20.0 },
  },
  gemini: {
    // Nivel gratuito: no se cobra, pero se siguen registrando los tokens.
    // Ojo: en el nivel gratuito Google usa el contenido para mejorar sus productos.
    free: {
      'gemini-3.8-flash': { input: 0, output: 0 },
      'gemini-3.6-flash': { input: 0, output: 0 },
      'gemini-3.5-flash-lite': { input: 0, output: 0 },
      'gemini-3.1-flash-lite': { input: 0, output: 0 },
    },
    // Nivel de pago. El output incluye los tokens de "thinking".
    // Los modelos flash cambian de precio el 2027-01-01 (validUntil / then).
    paid: {
      'gemini-3.8-flash': { input: 0.75, output: 3.75, validUntil: '2026-12-31', then: { input: 1.5, output: 7.5 } },
      'gemini-3.6-flash': { input: 0.75, output: 3.75, validUntil: '2026-12-31', then: { input: 1.5, output: 7.5 } },
      'gemini-3.5-flash-lite': { input: 0.3, output: 2.5 },
      'gemini-3.1-flash-lite': { input: 0.25, output: 1.5 },
    },
  },
};

export const GEMINI_TIERS = ['free', 'paid'];

const warned = new Set();

function warnOnce(key, message) {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[ai] ${message}`);
}

/** Devuelve { input, output } vigente para la fecha, o null si el modelo no está en la tabla. */
export function getPrice(provider, model, date = new Date()) {
  let table = PRICING[provider];
  if (provider === 'gemini') {
    table = table?.[process.env.GEMINI_TIER || 'free'];
  }

  const entry = table?.[model];
  if (!entry) return null;

  const today = date.toISOString().slice(0, 10);
  if (entry.validUntil && today > entry.validUntil) return entry.then;
  return { input: entry.input, output: entry.output };
}

/**
 * Coste estimado de una llamada en USD (6 decimales, como la columna DECIMAL(10,6)).
 * Devuelve null si el modelo no tiene precio conocido.
 */
export function estimateCostUsd(provider, model, promptTokens, completionTokens) {
  const price = getPrice(provider, model);
  if (!price) {
    warnOnce(`${provider}:${model}`, `Sin precio para ${provider}/${model}: el coste se registrará como null. Añádelo en pricing.js`);
    return null;
  }
  const cost = (promptTokens * price.input + completionTokens * price.output) / 1_000_000;
  return Math.round(cost * 1_000_000) / 1_000_000;
}
