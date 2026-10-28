import app from './src/config/app.js';
import { testConnection, closePool } from './src/config/database.js';

const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', 'ANTHROPIC_API_KEY'];

const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`[server] Faltan variables de entorno: ${missing.join(', ')}. Revisa tu archivo .env`);
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  console.log('[server] Iniciando TaskAI API, conectando a PostgreSQL...');
  try {
    await testConnection();
  } catch (err) {
    console.error(`[server] ${err.message}`);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`[server] TaskAI API escuchando en http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
  });

  // Apagado ordenado: deja de aceptar peticiones, termina las activas y cierra la BD.
  // AWS (ECS, Beanstalk) envía SIGTERM antes de detener el contenedor.
  const shutdown = (signal) => {
    console.log(`[server] ${signal} recibido, cerrando...`);
    server.close(async () => {
      await closePool();
      console.log('[server] Cerrado correctamente');
      process.exit(0);
    });
    // Si algo se queda colgado, forzamos la salida a los 10 s
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
