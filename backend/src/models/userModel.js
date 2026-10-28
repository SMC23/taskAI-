import { query } from '../config/database.js';
import { toDbError, isInvalidInput } from '../utils/errors.js';

// Columnas públicas: nunca devolvemos password_hash salvo cuando hace falta para el login
const PUBLIC_COLUMNS = 'id, email, name, created_at, updated_at';

/**
 * Busca un usuario por email (sin distinguir mayúsculas).
 * Incluye password_hash porque se usa para verificar la contraseña en el login.
 * @returns {Promise<object|null>}
 */
export async function findByEmail(email) {
  try {
    // lower(email) usa el índice único users_email_unique
    const { rows } = await query(
      `SELECT ${PUBLIC_COLUMNS}, password_hash
         FROM users
        WHERE lower(email) = lower($1)`,
      [email],
    );
    return rows[0] ?? null;
  } catch (err) {
    throw toDbError(err, 'Error al buscar usuario por email');
  }
}

/**
 * Busca un usuario por id. No incluye password_hash.
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  try {
    const { rows } = await query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id]);
    return rows[0] ?? null;
  } catch (err) {
    if (isInvalidInput(err)) return null; // UUID mal formado = no existe
    throw toDbError(err, 'Error al buscar usuario por id');
  }
}

/**
 * Crea un usuario. La contraseña debe llegar ya hasheada (bcrypt se aplica en el servicio).
 * Lanza AppError 409 si el email ya está registrado.
 * @returns {Promise<object>} usuario creado, sin password_hash
 */
export async function create({ email, passwordHash, name }) {
  try {
    // RETURNING devuelve la fila insertada sin necesidad de otra query
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING ${PUBLIC_COLUMNS}`,
      [email.trim(), passwordHash, name.trim()],
    );
    return rows[0];
  } catch (err) {
    throw toDbError(err, 'Error al crear usuario');
  }
}
