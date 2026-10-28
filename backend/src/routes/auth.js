import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate, registerSchema, loginSchema } from '../validators/authValidator.js';
import { authenticate } from '../middlewares/auth.js';
import * as authController from '../controllers/authController.js';

// Límite contra ataques de fuerza bruta: 20 intentos de login/registro por IP cada 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Demasiados intentos, inténtalo en 15 minutos' } },
});

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);

export default router;
