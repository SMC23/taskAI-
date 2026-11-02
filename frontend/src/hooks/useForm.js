import { useState } from 'react';
import { ApiError } from '../api/client.js';
import t from '../i18n/es.js';

/**
 * Estado de un formulario controlado: valores, errores por campo, error general y envío.
 * - validate(values) → { campo: mensaje } (validación en el cliente)
 * - onSubmit(values) → promesa; si lanza ApiError, se muestran sus errores
 * Al fallar, mueve el foco al primer campo con error (accesibilidad).
 */
export function useForm({ initialValues, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    if (submitting) return;
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
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof ApiError) {
        const serverErrors = err.fieldErrors;
        setFieldErrors(serverErrors);
        setFormError(err.message);
        const firstServerInvalid = Object.keys(serverErrors)[0];
        if (firstServerInvalid) focusField(firstServerInvalid);
      } else {
        setFormError(t.errors.UNKNOWN);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return { values, fieldErrors, formError, submitting, handleChange, handleSubmit };
}
