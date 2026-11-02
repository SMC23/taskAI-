import * as anthropicProvider from './anthropicProvider.js';
import * as geminiProvider from './geminiProvider.js';
import { GEMINI_TIERS } from '../pricing.js';

/**
 * Fábrica de proveedores de IA: elige la implementación según AI_PROVIDER.
 * Para añadir un proveedor, crea su archivo con el mismo contrato y regístralo aquí.
 */
const PROVIDERS = {
  anthropic: anthropicProvider,
  gemini: geminiProvider,
};

export const SUPPORTED_PROVIDERS = Object.keys(PROVIDERS);
export const DEFAULT_PROVIDER = 'gemini';

let overrideForTesting = null;

/** Nombre del proveedor configurado (se lee en cada llamada, así un cambio de AI_PROVIDER se aplica). */
export function getProviderName() {
  return (process.env.AI_PROVIDER || DEFAULT_PROVIDER).trim().toLowerCase();
}

/**
 * Comprueba la configuración de IA. server.js la llama al arrancar para fallar
 * pronto con un mensaje claro. Nunca incluye el valor de las keys en el mensaje.
 * @returns {{ provider: string, model: string }}
 */
export function validateAiConfig() {
  const providerName = getProviderName();
  const provider = PROVIDERS[providerName];

  if (!provider) {
    throw new Error(`AI_PROVIDER="${providerName}" no es válido. Valores permitidos: ${SUPPORTED_PROVIDERS.join(', ')}`);
  }
  if (!process.env[provider.API_KEY_ENV]?.trim()) {
    throw new Error(`AI_PROVIDER=${providerName} requiere la variable ${provider.API_KEY_ENV} en el .env`);
  }
  if (providerName === 'gemini' && process.env.GEMINI_TIER && !GEMINI_TIERS.includes(process.env.GEMINI_TIER)) {
    throw new Error(`GEMINI_TIER="${process.env.GEMINI_TIER}" no es válido. Valores permitidos: ${GEMINI_TIERS.join(', ')}`);
  }

  return { provider: providerName, model: provider.getModel() };
}

/**
 * Devuelve el proveedor activo: { name, getModel(), generateStructured() }.
 * taskGenerator solo conoce este objeto, nunca un SDK concreto.
 */
export function getProvider() {
  if (overrideForTesting) return overrideForTesting;

  const providerName = getProviderName();
  const provider = PROVIDERS[providerName];
  if (!provider) {
    throw new Error(`Proveedor de IA desconocido: "${providerName}"`);
  }
  return provider;
}

/** Sustituye el proveedor por uno falso en los tests (null para restaurar). */
export function setProviderForTesting(fakeProvider) {
  overrideForTesting = fakeProvider;
}
