import t from '../../i18n/es.js';

/** Marco común de las pantallas de login y registro. */
export function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <p className="text-center text-2xl font-bold tracking-tight text-indigo-600">{t.app.name}</p>
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </section>
        {footer && <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>}
      </div>
    </main>
  );
}
