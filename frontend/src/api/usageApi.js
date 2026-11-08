import { apiRequest } from './client.js';

// Contrato: backend/src/routes/usage.js y services/usageService.js

/** GET /usage/summary?days=N → { period, totals, latency, daily, by_model, recent_calls } */
export function getUsageSummary(days, { signal } = {}) {
  return apiRequest(`/usage/summary?days=${encodeURIComponent(days)}`, { signal });
}
