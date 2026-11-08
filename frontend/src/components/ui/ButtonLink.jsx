import { Link } from 'react-router';
import { buttonClasses } from './buttonStyles.js';

/** Enlace de navegación con aspecto de botón (navega, no ejecuta acciones). */
export function ButtonLink({ to, variant = 'primary', className = '', children }) {
  return (
    <Link to={to} className={`${buttonClasses(variant)} ${className}`}>
      {children}
    </Link>
  );
}
