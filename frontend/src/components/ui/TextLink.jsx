import { Link } from 'react-router';

/** Enlace interno con el estilo de la app y foco visible. */
export function TextLink({ to, children }) {
  return (
    <Link
      to={to}
      className="rounded font-semibold text-indigo-600 hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      {children}
    </Link>
  );
}
