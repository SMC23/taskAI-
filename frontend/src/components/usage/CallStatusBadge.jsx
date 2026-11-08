import t from '../../i18n/es.js';
import { Badge } from '../ui/Badge.jsx';

const ICON_PATHS = {
  success: 'M5 13l4 4L19 7',
  error: 'M6 6l12 12M18 6L6 18',
};

/** Estado de una llamada a la IA: texto + icono + color. */
export function CallStatusBadge({ status }) {
  return (
    <Badge tone={status === 'success' ? 'emerald' : 'red'}>
      <svg className="size-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d={ICON_PATHS[status]} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {t.usage.callStatus[status]}
    </Badge>
  );
}
