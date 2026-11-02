/*
 * Guardamos el JWT en localStorage para que la sesión sobreviva a recargas.
 *
 * RIESGO (XSS): cualquier JavaScript que se ejecute en esta página puede leer
 * localStorage. Si la app sufriera un XSS (un script inyectado, por ejemplo desde
 * una dependencia comprometida o un contenido mal escapado), el atacante podría
 * copiar el token y usarlo desde su máquina hasta que caduque (7 días).
 *
 * ALTERNATIVA: que el backend entregue el token en una cookie httpOnly + Secure +
 * SameSite. JavaScript no puede leer esa cookie, así que un XSS no puede robarla
 * (aunque sí podría hacer peticiones mientras la página está abierta). A cambio,
 * hay que cambiar el backend (emitir/leer la cookie, logout que la borre) y añadir
 * protección CSRF. Es la opción recomendada para producción.
 *
 * Los accesos van en try/catch: en modo privado o con el almacenamiento bloqueado
 * localStorage puede lanzar errores; en ese caso la sesión simplemente no persiste.
 */
const TOKEN_KEY = 'taskai.token';

export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // almacenamiento no disponible: la sesión durará solo mientras la pestaña esté abierta
    }
  },

  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // nada que borrar si el almacenamiento no está disponible
    }
  },
};
