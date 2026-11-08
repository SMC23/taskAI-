import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { aiLimiter } from '../middlewares/rateLimiters.js';
import { validate } from '../validators/validate.js';
import { createProjectSchema, updateProjectSchema } from '../validators/projectValidator.js';
import { idParamsSchema } from '../validators/paramsValidator.js';
import * as projectController from '../controllers/projectController.js';

const router = Router();

// Todas las rutas de proyectos requieren sesión
router.use(authenticate);

// authenticate va antes que aiLimiter: las peticiones sin token no gastan cupo de IA
router.post('/', aiLimiter, validate(createProjectSchema), projectController.create);
router.get('/', projectController.getAll);
router.get('/:id', validate(idParamsSchema, 'params'), projectController.getOne);
router.patch('/:id', validate(idParamsSchema, 'params'), validate(updateProjectSchema), projectController.updateStatus);

export default router;
