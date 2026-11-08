import { z } from 'zod';
import { TASK_STATUSES } from '../models/taskModel.js';

export const updateTaskSchema = z.object({
  status: z.enum(TASK_STATUSES, { error: `El estado debe ser uno de: ${TASK_STATUSES.join(', ')}` }),
});
