const LOCALE = 'es';

const integerFormat = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const secondsFormat = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const percentFormat = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 1 });
const dayShortFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', timeZone: 'UTC' });
const dayLongFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const formatInteger = (value) => integerFormat.format(value);
export const formatPercent = (ratio) => percentFormat.format(ratio);

/** 850 → "850 ms"; 2500 → "2,5 s". */
export const formatLatency = (ms) => (ms < 1000 ? `${integerFormat.format(ms)} ms` : `${secondsFormat.format(ms / 1000)} s`);

/** Importes por debajo del céntimo conservan los decimales (un coste real de IA suele serlo). */
export function formatUsd(amount) {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: amount < 0.01 ? 6 : 2,
  }).format(amount);
}

// Los días de la serie son fechas UTC 'YYYY-MM-DD': se formatean en UTC para no desplazarlas un día
const utcDay = (date) => new Date(`${date}T00:00:00Z`);
export const formatDayShort = (date) => dayShortFormat.format(utcDay(date));
export const formatDayLong = (date) => dayLongFormat.format(utcDay(date));

/** Fecha y hora de un evento, en la hora local del navegador. */
export const formatDateTime = (isoDate) => dateTimeFormat.format(new Date(isoDate));
