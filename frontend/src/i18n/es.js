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
    // Mismas reglas que backend/src/validators/projectValidator.js
    titleRequired: 'El título es obligatorio',
    titleMin: 'El título debe tener al menos 3 caracteres',
    titleMax: 'El título no puede superar los 100 caracteres',
    descriptionRequired: 'La descripción es obligatoria',
    descriptionMin: 'Describe tu proyecto con al menos 20 caracteres para que la IA tenga contexto',
    descriptionMax: 'La descripción no puede superar los 2000 caracteres',
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
    PROJECT_NOT_FOUND: 'Este proyecto no existe o no tienes acceso a él.',
    TASK_NOT_FOUND: 'Esta tarea ya no existe.',
    AI_UNAVAILABLE: 'El servicio de IA no está disponible en este momento.',
    AI_ERROR: 'El servicio de IA devolvió un error.',
    AI_INVALID_RESPONSE: 'La IA devolvió una respuesta que no pudimos usar.',
    NETWORK_ERROR: 'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.',
    UNKNOWN: 'Ha ocurrido un error inesperado. Inténtalo de nuevo.',
  },

  connection: {
    title: 'No se pudo conectar con el servidor',
    description: 'No pudimos comprobar tu sesión. Revisa tu conexión o inténtalo en unos segundos.',
  },

  nav: {
    backToProjects: '← Volver a mis proyectos',
    usage: 'Consumo',
  },

  usage: {
    title: 'Consumo de IA',
    subtitle: 'Cuánto has usado la IA y cómo ha respondido.',
    loading: 'Cargando consumo…',
    loadError: 'No se pudo cargar tu consumo de IA.',
    periodLabel: 'Periodo',
    periodOption: (days) => `Últimos ${days} días`,
    noValue: '—',
    empty: {
      title: (days) => `Sin llamadas a la IA en los últimos ${days} días`,
      description: 'Cada vez que la IA genera las tareas de un proyecto, el consumo aparece aquí.',
      action: 'Crear un proyecto',
    },
    cards: {
      calls: 'Llamadas',
      callsDetail: (failed) => (failed === 1 ? '1 fallida' : `${failed} fallidas`),
      tokens: 'Tokens totales',
      tokensDetail: (input, output) => `${input} de entrada · ${output} de salida`,
      latency: 'Latencia media',
      latencyDetail: (p95) => `p95: ${p95}`,
      latencyEmpty: 'Sin llamadas exitosas',
      successRate: 'Tasa de éxito',
      successDetail: (successful, calls) => `${successful} de ${calls} ${calls === '1' ? 'llamada' : 'llamadas'}`,
      cost: 'Coste estimado',
    },
    cost: {
      estimated: 'Según los precios conocidos',
      free: 'No aplica (nivel gratuito)',
      unknown: 'Sin precio conocido',
      unknownDetail: (count) => (count === 1 ? '1 llamada de un modelo sin precio' : `${count} llamadas de modelos sin precio`),
      unknownNote: (count) => (count === 1 ? 'No incluye 1 llamada sin precio conocido' : `No incluye ${count} llamadas sin precio conocido`),
      noUsage: 'Sin consumo',
      noUsageDetail: 'Las llamadas fallaron sin gastar tokens',
    },
    chart: {
      title: 'Llamadas por día',
      hint: 'Días en UTC. Pasa el cursor, toca una barra o usa las flechas para ver los valores.',
      barsLabel: 'Barras de llamadas por día. Usa las flechas izquierda y derecha para cambiar de día.',
      barLabel: (day, calls, tokens) => `${day}: ${calls} ${calls === 1 ? 'llamada' : 'llamadas'}, ${tokens} tokens`,
      callsUnit: (calls) => (calls === 1 ? 'llamada' : 'llamadas'),
      tokensUnit: 'tokens',
      tableCaption: 'Llamadas y tokens por día (UTC)',
      dayColumn: 'Día',
      callsColumn: 'Llamadas',
      tokensColumn: 'Tokens',
    },
    calls: {
      title: 'Últimas llamadas',
      hint: 'Las 10 más recientes del periodo, en tu hora local.',
      date: 'Fecha',
      provider: 'Proveedor',
      model: 'Modelo',
      tokens: 'Tokens',
      latency: 'Latencia',
      status: 'Estado',
      errorPrefix: 'Error:',
      errorTypes: {
        unavailable: 'El proveedor de IA no estaba disponible.',
        invalid_response: 'La respuesta no tuvo el formato esperado.',
        request_failed: 'El proveedor de IA rechazó la solicitud.',
        unknown: 'Se produjo un error inesperado.',
      },
      compactMeta: (provider, model, latency) => `${provider} · ${model} · ${latency}`,
    },
    callStatus: {
      success: 'Correcta',
      error: 'Fallida',
    },
  },

  dashboard: {
    title: 'Tus proyectos',
    subtitle: (name) => `Hola, ${name}. Este es el avance de tus proyectos.`,
    newProject: 'Nuevo proyecto',
    loading: 'Cargando proyectos…',
    loadError: 'No se pudieron cargar tus proyectos.',
    empty: {
      title: 'Aún no tienes proyectos',
      description: 'Describe tu objetivo en lenguaje natural y la IA lo convertirá en una lista de tareas ordenadas.',
      action: 'Crear mi primer proyecto',
    },
  },

  projectStatus: {
    pending: 'Pendiente',
    active: 'En curso',
    completed: 'Completado',
  },

  progress: {
    label: (completed, total) => `${completed} de ${total} tareas completadas`,
    noTasks: 'Sin tareas',
  },

  newProject: {
    title: 'Nuevo proyecto',
    subtitle: 'Cuenta qué quieres lograr. Cuanto más contexto des (plazos, recursos, objetivo), mejores serán las tareas.',
    titleLabel: 'Título',
    titlePlaceholder: 'Ej.: Lanzar mi tienda online',
    descriptionLabel: 'Describe tu proyecto',
    descriptionPlaceholder: 'Ej.: Quiero lanzar mi tienda online de ropa en 2 meses. Ya tengo proveedores, pero no tengo web ni redes sociales…',
    descriptionHint: 'Entre 20 y 2000 caracteres.',
    counter: (length, max) => `${length} / ${max} caracteres`,
    submit: 'Generar tareas con IA',
    submitting: 'Generando tareas…',
    generating: 'La IA está analizando tu descripción y generando las tareas. Suele tardar entre 5 y 30 segundos; no cierres esta página.',
    errors: {
      rateLimited: (minutes) =>
        minutes
          ? `Has alcanzado el límite de proyectos generados con IA. Podrás crear otro en unos ${minutes} min.`
          : 'Has alcanzado el límite de proyectos generados con IA. Espera un rato antes de crear otro.',
      invalidResponse: 'La IA devolvió una respuesta que no pudimos usar. No se guardó nada; puedes intentarlo de nuevo.',
      unavailable: 'El servicio de IA no está disponible en este momento. No se guardó nada; inténtalo de nuevo en unos minutos.',
    },
  },

  project: {
    loading: 'Cargando proyecto…',
    loadError: 'No se pudo cargar el proyecto.',
    created: (count) => `Proyecto creado. La IA generó ${count} tareas.`,
    statusLabel: 'Estado del proyecto',
    statusError: 'No se pudo cambiar el estado del proyecto.',
    notFound: {
      title: 'Proyecto no encontrado',
      description: 'Este proyecto no existe o no tienes acceso a él.',
    },
  },

  tasks: {
    title: (count) => `Tareas (${count})`,
    empty: 'Este proyecto no tiene tareas.',
    statusLabel: (title) => `Estado de «${title}»`,
    statusError: 'No se pudo cambiar el estado; se restauró el anterior.',
    delete: 'Eliminar',
    deleteLabel: (title) => `Eliminar «${title}»`,
    deleteConfirm: '¿Eliminar esta tarea?',
    deleteConfirmAction: 'Sí, eliminar',
    deleting: 'Eliminando…',
    cancel: 'Cancelar',
    deleteError: 'No se pudo eliminar la tarea.',
    deleted: 'Tarea eliminada.',
  },

  taskStatus: {
    todo: 'Por hacer',
    in_progress: 'En progreso',
    completed: 'Completada',
  },

  priority: {
    high: 'Prioridad alta',
    medium: 'Prioridad media',
    low: 'Prioridad baja',
  },
};

export default es;
