import * as usageService from '../services/usageService.js';

/** GET /api/usage/summary?days=30 → 200 { period, totals, latency, daily, by_model, recent_calls } */
export async function getSummary(req, res) {
  const summary = await usageService.getSummary(req.userId, req.query.days);
  res.json(summary);
}
