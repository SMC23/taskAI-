const VARIANTS = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-400',
  secondary: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:text-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-500 disabled:bg-red-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-none disabled:text-slate-400',
};

/** Clases compartidas por <Button> y <ButtonLink>. */
export function buttonClasses(variant = 'primary', size = 'md') {
  const sizes = { md: 'px-4 py-2.5 text-sm', sm: 'px-3 py-1.5 text-sm' };
  return `inline-flex items-center justify-center gap-2 rounded-lg font-semibold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed ${sizes[size]} ${VARIANTS[variant]}`;
}
