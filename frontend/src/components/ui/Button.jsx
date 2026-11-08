import { buttonClasses } from './buttonStyles.js';
import { Spinner } from './Spinner.jsx';

/** Botón con estado de carga: se deshabilita y muestra un spinner mientras `loading`. */
export function Button({ type = 'button', variant = 'primary', size = 'md', loading = false, loadingText, className = '', children, ...props }) {
  return (
    <button
      {...props}
      type={type}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
      className={`${buttonClasses(variant, size)} ${className}`}
    >
      {loading && <Spinner className="size-4" />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
