/**
 * Todos los textos de la interfaz, en un solo lugar.
 * Para traducir la app basta con crear otro archivo con la misma forma.
 */
const es = {
  app: {
    name: 'TaskAI',
  },

  common: {
    loading: 'Cargando…',
    retry: 'Reintentar',
  },

  fields: {
    name: 'Nombre',
    email: 'Email',
    password: 'Contraseña',
  },

  auth: {
    login: {
      title: 'Inicia sesión',
      subtitle: 'Accede a tus proyectos y tareas.',
      submit: 'Entrar',
      submitting: 'Entrando…',
      noAccount: '¿No tienes cuenta?',
      toRegister: 'Regístrate',
    },
    register: {
      title: 'Crea tu cuenta',
      subtitle: 'Describe tus proyectos y deja que la IA organice las tareas.',
      submit: 'Crear cuenta',
      submitting: 'Creando cuenta…',
      passwordHint: 'Entre 8 y 72 caracteres, con al menos una mayúscula, una minúscula y un número.',
      hasAccount: '¿Ya tienes cuenta?',
      toLogin: 'Inicia sesión',
    },
    logout: 'Cerrar sesión',
    sessionExpired: 'Tu sesión ha caducado o ya no es válida. Vuelve a iniciar sesión.',
  },

  // Mismas reglas y mensajes que backend/src/validators/authValidator.js
  validation: {
    nameRequired: 'El nombre es obligatorio',
    nameMin: 'El nombre debe tener al menos 2 caracteres',
    nameMax: 'El nombre no puede superar los 50 caracteres',
    emailRequired: 'El email es obligatorio',
    emailInvalid: 'El email no es válido',
    passwordRequired: 'La contraseña es obligatoria',
    passwordMin: 'La contraseña debe tener al menos 8 caracteres',
    passwordMax: 'La contraseña no puede superar los 72 caracteres',
    passwordUpper: 'La contraseña debe tener al menos una mayúscula',
    passwordLower: 'La contraseña debe tener al menos una minúscula',
    passwordNumber: 'La contraseña debe tener al menos un número',
  },

  // Mensajes por código de error del backend (error.code)
  errors: {
    INVALID_CREDENTIALS: 'Email o contraseña incorrectos.',
    EMAIL_IN_USE: 'Ya existe una cuenta con ese email.',
    VALIDATION_ERROR: 'Revisa los campos marcados.',
    RATE_LIMITED: 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.',
    NO_TOKEN: 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
    INVALID_TOKEN: 'Tu sesión ya no es válida. Vuelve a iniciar sesión.',
    TOKEN_EXPIRED: 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
    NETWORK_ERROR: 'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.',
    UNKNOWN: 'Ha ocurrido un error inesperado. Inténtalo de nuevo.',
  },

  connection: {
    title: 'No se pudo conectar con el servidor',
    description: 'No pudimos comprobar tu sesión. Revisa tu conexión o inténtalo en unos segundos.',
  },

  dashboard: {
    greeting: (name) => `Hola, ${name}`,
    comingSoon: 'Dashboard próximamente.',
    description: 'Aquí verás tus proyectos y el progreso de sus tareas.',
  },
};

export default es;
