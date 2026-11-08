import { z } from 'zod';

const DAYS_ERROR = 'days debe ser un número entero entre 1 y 90';

/** Query de GET /api/usage/summary. coerce porque en la URL todo llega como texto. */
export const usageQuerySchema = z.object({
  days: z.coerce.number({ error: DAYS_ERROR }).int(DAYS_ERROR).min(1, DAYS_ERROR).max(90, DAYS_ERROR).default(30),
});
