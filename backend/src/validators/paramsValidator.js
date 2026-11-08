import { z } from 'zod';

/** Parámetro de ruta :id con formato UUID (proyectos y tareas). */
export const idParamsSchema = z.object({
  id: z.uuid({ error: 'El id no es válido' }),
});
