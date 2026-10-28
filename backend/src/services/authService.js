import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/userModel.js';
import { AppError } from '../utils/errors.js';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Hash válido de una contraseña aleatoria. Se compara contra él cuando el email
// no existe, para que el login tarde lo mismo exista o no el usuario (evita que
// se pueda averiguar qué emails están registrados midiendo el tiempo de respuesta).
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', SALT_ROUNDS);

const invalidCredentials = () => new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

/** Devuelve solo los campos públicos del usuario. */
function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

/**
 * Genera un JWT firmado con JWT_SECRET. Payload mínimo: { userId, iat }
 * (`iat` y `exp` los añade jsonwebtoken automáticamente).
 */
export function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Registra un usuario nuevo y devuelve { token, user }.
 * Lanza 409 si el email ya está registrado.
 */
export async function register(name, email, password) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new AppError('Email already registered', 409, 'EMAIL_IN_USE');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  // Si dos registros con el mismo email llegan a la vez, el índice único de la BD
  // hace que el segundo falle y userModel lo traduce también a un 409.
  const user = await userModel.create({ email, passwordHash, name });

  return { token: generateToken(user.id), user: toPublicUser(user) };
}

/**
 * Inicia sesión y devuelve { token, user }.
 * Ante cualquier fallo lanza siempre el mismo error genérico 401.
 */
export async function login(email, password) {
  const user = await userModel.findByEmail(email);

  // Se ejecuta bcrypt.compare SIEMPRE, también si el usuario no existe
  const passwordMatches = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);

  if (!user || !passwordMatches) {
    throw invalidCredentials();
  }

  return { token: generateToken(user.id), user: toPublicUser(user) };
}
