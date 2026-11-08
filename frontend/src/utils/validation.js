import t from '../i18n/es.js';

/*
 * Validación en el cliente: refleja las reglas del backend
 * (backend/src/validators/authValidator.js) para avisar antes de enviar.
 * El backend sigue siendo la fuente de verdad: sus errores también se muestran.
 * Cada función devuelve { campo: mensaje } con el primer error de cada campo,
 * en el orden de los campos del formulario.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  const value = email.trim();
  if (!value) return t.validation.emailRequired;
  if (!EMAIL_PATTERN.test(value)) return t.validation.emailInvalid;
  return null;
}

function validateName(name) {
  const value = name.trim();
  if (!value) return t.validation.nameRequired;
  if (value.length < 2) return t.validation.nameMin;
  if (value.length > 50) return t.validation.nameMax;
  return null;
}

function validateNewPassword(password) {
  if (!password) return t.validation.passwordRequired;
  if (password.length < 8) return t.validation.passwordMin;
  if (password.length > 72) return t.validation.passwordMax;
  if (!/[A-Z]/.test(password)) return t.validation.passwordUpper;
  if (!/[a-z]/.test(password)) return t.validation.passwordLower;
  if (!/[0-9]/.test(password)) return t.validation.passwordNumber;
  return null;
}

/** Quita los campos sin error. */
function compact(errors) {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
}

export function validateLogin({ email, password }) {
  return compact({
    email: validateEmail(email),
    password: password ? null : t.validation.passwordRequired,
  });
}

export function validateRegister({ name, email, password }) {
  return compact({
    name: validateName(name),
    email: validateEmail(email),
    password: validateNewPassword(password),
  });
}

export const PROJECT_LIMITS = { titleMin: 3, titleMax: 100, descriptionMin: 20, descriptionMax: 2000 };

export function validateProject({ title, description }) {
  const cleanTitle = title.trim();
  const cleanDescription = description.trim();
  let titleError = null;
  if (!cleanTitle) titleError = t.validation.titleRequired;
  else if (cleanTitle.length < PROJECT_LIMITS.titleMin) titleError = t.validation.titleMin;
  else if (cleanTitle.length > PROJECT_LIMITS.titleMax) titleError = t.validation.titleMax;

  let descriptionError = null;
  if (!cleanDescription) descriptionError = t.validation.descriptionRequired;
  else if (cleanDescription.length < PROJECT_LIMITS.descriptionMin) descriptionError = t.validation.descriptionMin;
  else if (cleanDescription.length > PROJECT_LIMITS.descriptionMax) descriptionError = t.validation.descriptionMax;

  return compact({ title: titleError, description: descriptionError });
}
