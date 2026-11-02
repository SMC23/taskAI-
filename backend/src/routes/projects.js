import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { aiLimiter } from '../middlewares/rateLimiters.js';
import { validate } from '../validators/validate.js';
import { createProjectSchema } from '../validators/projectValidator.js';
import * as projectController from '../controllers/projectController.js';

const router = Router();

// Todas las rutas de proyectos requieren sesión
router.use(authenticate);

// authenticate va antes que aiLimiter: las peticiones sin token no gastan cupo de IA
router.post('/', aiLimiter, validate(createProjectSchema), projectController.create);
router.get('/', projectController.getAll);
router.get('/:id', projectController.getOne);

export default router;
