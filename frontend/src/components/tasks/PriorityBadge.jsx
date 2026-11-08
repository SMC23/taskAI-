import t from '../../i18n/es.js';
import { Badge } from '../ui/Badge.jsx';

const TONE = { high: 'red', medium: 'amber', low: 'slate' };
// Flecha hacia arriba / lado / abajo: refuerza la prioridad sin depender del color
const ICON_PATH = { high: 'M8 12V4M4 8l4-4 4 4', medium: 'M3 8h10M9 4l4 4-4 4', low: 'M8 4v8M4 8l4 4 4-4' };

/** Prioridad con texto + icono + color (el color solo no es accesible). */
export function PriorityBadge({ priority }) {
  return (
    <Badge tone={TONE[priority] ?? 'slate'}>
      <svg className="size-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d={ICON_PATH[priority] ?? ICON_PATH.medium} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {t.priority[priority] ?? priority}
    </Badge>
  );
}
