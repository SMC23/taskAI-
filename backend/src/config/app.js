import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { notFound, errorHandler } from '../middlewares/errorHandler.js';

const ONE_HOUR_MS = 60 * 60 * 1000;

const rateLimitMessage = (message) => ({ error: { code: 'RATE_LIMITED', message } });

/** Límite general para toda la API. */
export const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: 'draft-8', // cabeceras RateLimit-* estándar
  legacyHeaders: false,
  message: rateLimitMessage('Demasiadas peticiones, inténtalo más tarde'),
});

/**
 * Límite estricto para los endpoints que llaman a la IA: 10 peticiones por hora
 * por IP. Cada llamada cuesta dinero, así que se aplica en la ruta de IA además
 * del límite global: router.post('/generate', aiLimiter, controller)
 */
export const aiLimiter = rateLimit({
  windowMs: ONE_HOUR_MS,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: rateLimitMessage('Has alcanzado el límite de 10 generaciones con IA por hora'),
});

const app = express();

// Detrás de un balanceador (AWS ALB, Nginx) la IP real llega en X-Forwarded-For.
// Sin esto el rate limit vería la IP del balanceador y limitaría a todos a la vez.
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
}

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '100kb' })); // evita bodies gigantes
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', globalLimiter);

// Health check para el balanceador de carga / monitorización
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Aquí se montarán las rutas en el Paso 3 (auth, projects, tasks)

app.use(notFound);
app.use(errorHandler);

export default app;
