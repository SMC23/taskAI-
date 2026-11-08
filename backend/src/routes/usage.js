import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../validators/validate.js';
import { usageQuerySchema } from '../validators/usageValidator.js';
import * as usageController from '../controllers/usageController.js';

const router = Router();

// El usuario sale siempre del token; nunca de un parámetro del cliente
router.use(authenticate);

router.get('/summary', validate(usageQuerySchema, 'query'), usageController.getSummary);

export default router;
