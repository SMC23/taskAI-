import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { notFound, errorHandler } from '../middlewares/errorHandler.js';
import { globalLimiter } from '../middlewares/rateLimiters.js';
import authRoutes from '../routes/auth.js';
import projectRoutes from '../routes/projects.js';
import taskRoutes from '../routes/tasks.js';
import usageRoutes from '../routes/usage.js';

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
    // Sin esto el navegador oculta Retry-After al frontend (no es una cabecera "segura" de CORS)
    exposedHeaders: ['Retry-After'],
  }),
);
app.use(express.json({ limit: '100kb' })); // evita bodies gigantes
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', globalLimiter);

// Health check para el balanceador de carga / monitorización
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/usage', usageRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
