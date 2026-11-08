import { useEffect, useRef, useState } from 'react';
import t from '../../i18n/es.js';
import { Button } from '../ui/Button.jsx';

/**
 * Borrado con confirmación en línea (sin ventana emergente).
 * Al pedir confirmación el foco va a "Cancelar" (la opción segura); Escape cancela.
 */
export function DeleteTaskButton({ taskTitle, onConfirm }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const cancelRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
  }, [confirming]);

  function cancel() {
    setConfirming(false);
    // Devuelve el foco al botón que abrió la confirmación (tras volver a pintarse)
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  async function confirm() {
    setDeleting(true);
    const deleted = await onConfirm();
    // Si se borró, el componente desaparece; si falló, se vuelve al botón inicial
    if (!deleted) {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <Button ref={triggerRef} variant="ghost" size="sm" aria-label={t.tasks.deleteLabel(taskTitle)} onClick={() => setConfirming(true)}>
        <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sm:sr-only">{t.tasks.delete}</span>
      </Button>
    );
  }

  return (
    <div
      role="group"
      aria-label={t.tasks.deleteConfirm}
      className="flex flex-wrap items-center gap-2"
      onKeyDown={(event) => event.key === 'Escape' && !deleting && cancel()}
    >
      <span className="text-sm text-slate-700">{t.tasks.deleteConfirm}</span>
      <Button variant="danger" size="sm" loading={deleting} loadingText={t.tasks.deleting} onClick={confirm}>
        {t.tasks.deleteConfirmAction}
      </Button>
      <Button ref={cancelRef} variant="secondary" size="sm" disabled={deleting} onClick={cancel}>
        {t.tasks.cancel}
      </Button>
    </div>
  );
}
