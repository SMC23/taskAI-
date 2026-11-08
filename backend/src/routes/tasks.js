import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../validators/validate.js';
import { idParamsSchema } from '../validators/paramsValidator.js';
import { updateTaskSchema } from '../validators/taskValidator.js';
import * as taskController from '../controllers/taskController.js';

const router = Router();

// Todas las rutas de tareas requieren sesión
router.use(authenticate);

router.patch('/:id', validate(idParamsSchema, 'params'), validate(updateTaskSchema), taskController.updateStatus);
router.delete('/:id', validate(idParamsSchema, 'params'), taskController.remove);

export default router;
