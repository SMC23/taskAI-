import pg from 'pg';

const { Pool, types } = pg;

// Por defecto `pg` devuelve NUMERIC y BIGINT como string para no perder precisión.
// Nuestros valores (costes con 6 decimales, COUNT/SUM) caben sin problema en un
// Number de JavaScript, así que los convertimos para devolver datos limpios.
types.setTypeParser(types.builtins.NUMERIC, (value) => parseFloat(value));
types.setTypeParser(types.builtins.INT8, (value) => parseInt(value, 10));

function buildSslConfig() {
  if (process.env.DB_SSL !== 'true') return false;
  // En AWS RDS se recomienda verificar el certificado; solo desactívalo en entornos de prueba.
  return { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' };
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: buildSslConfig(),
  max: Number(process.env.DB_POOL_MAX) || 10, // conexiones abiertas como máximo
  idleTimeoutMillis: 30_000, // cierra conexiones inactivas tras 30 s
  connectionTimeoutMillis: 5_000, // falla si no consigue conexión en 5 s
});

// Un cliente inactivo del pool puede fallar (p. ej. si la BD se reinicia).
// Sin este listener, el error tumbaría el proceso de Node.
pool.on('error', (err) => {
  console.error('[db] Error inesperado en un cliente inactivo del pool:', err.message);
});

/** Ejecuta una query usando una conexión del pool (se devuelve sola al terminar). */
export function query(text, params) {
  return pool.query(text, params);
}

/**
 * Ejecuta `callback` dentro de una transacción. Si algo falla, hace ROLLBACK.
 * El callback recibe el cliente, que debe pasarse a los modelos para que todas
 * las queries usen la misma conexión.
 */
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Comprueba que la base de datos responde. Reintenta varias veces porque, al
 * arrancar con Docker o en AWS, la BD puede tardar unos segundos en estar lista.
 */
export async function testConnection({ retries = 5, delayMs = 2_000 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { rows } = await pool.query('SELECT current_database() AS db, version() AS version');
      console.log(`[db] Conectado a "${rows[0].db}" (${rows[0].version.split(',')[0]})`);
      return true;
    } catch (err) {
      console.error(`[db] Intento ${attempt}/${retries} fallido: ${err.message}`);
      if (attempt === retries) {
        throw new Error('No se pudo conectar a PostgreSQL. Revisa DATABASE_URL y que el servidor esté activo.', {
          cause: err,
        });
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/** Cierra todas las conexiones del pool (apagado ordenado del servidor). */
export function closePool() {
  return pool.end();
}
