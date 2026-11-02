import { z } from 'zod';
import { PROJECT_STATUSES } from '../models/projectModel.js';

export const createProjectSchema = z.object({
  title: z
    .string({ error: 'El título es obligatorio' })
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede superar los 100 caracteres'),
  // La IA necesita contexto suficiente para generar tareas útiles
  description: z
    .string({ error: 'La descripción es obligatoria' })
    .trim()
    .min(20, 'Describe tu proyecto con al menos 20 caracteres para que la IA tenga contexto')
    .max(2000, 'La descripción no puede superar los 2000 caracteres'),
});

export const updateProjectSchema = z.object({
  status: z.enum(PROJECT_STATUSES, { error: `El estado debe ser uno de: ${PROJECT_STATUSES.join(', ')}` }),
});
