import { Router } from 'express';
import { validate, registerSchema, loginSchema } from '../validators/authValidator.js';
import { authenticate } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiters.js';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);

export default router;
