import t from '../../i18n/es.js';
import { Badge } from '../ui/Badge.jsx';

const TONE = { pending: 'slate', active: 'indigo', completed: 'emerald' };

export function ProjectStatusBadge({ status }) {
  return <Badge tone={TONE[status] ?? 'slate'}>{t.projectStatus[status] ?? status}</Badge>;
}
