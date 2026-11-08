import { useRef, useState } from 'react';
import { ApiError } from '../api/client.js';
import t from '../i18n/es.js';

/**
 * Estado de un formulario controlado: valores, errores por campo, error general y envío.
 * - validate(values) → { campo: mensaje } (validación en el cliente)
 * - onSubmit(values) → promesa; si lanza ApiError, se muestran sus errores
 * - getErrorMessage(err) (opcional) → mensaje propio para ciertos errores de la API
 * Al fallar, mueve el foco al primer campo con error (accesibilidad).
 */
export function useForm({ initialValues, validate, onSubmit, getErrorMessage }) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // El estado `submitting` tarda un render en aplicarse; la ref bloquea un segundo
  // envío inmediato (doble clic o Enter repetido) antes de que eso ocurra.
  const submittingRef = useRef(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // El error del campo desaparece en cuanto el usuario lo corrige
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submittingRef.current) return;
    const form = event.currentTarget;
    const focusField = (name) => form.elements.namedItem(name)?.focus();

    setFormError('');
    const clientErrors = validate(values);
    const firstInvalid = Object.keys(clientErrors)[0];
    if (firstInvalid) {
      setFieldErrors(clientErrors);
      focusField(firstInvalid);
      return;
    }

    setFieldErrors({});
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof ApiError) {
        const serverErrors = err.fieldErrors;
        setFieldErrors(serverErrors);
        setFormError(getErrorMessage?.(err) ?? err.message);
        const firstServerInvalid = Object.keys(serverErrors)[0];
        if (firstServerInvalid) focusField(firstServerInvalid);
      } else {
        setFormError(t.errors.UNKNOWN);
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return { values, fieldErrors, formError, submitting, handleChange, handleSubmit };
}
