const TONES = {
  error: 'bg-red-50 text-red-800 ring-red-200',
  info: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
};

/** Mensaje destacado. Los errores usan role="alert" para que el lector de pantalla los anuncie. */
export function Alert({ tone = 'error', children }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-lg px-4 py-3 text-sm ring-1 ${TONES[tone]}`}>
      {children}
    </div>
  );
}
