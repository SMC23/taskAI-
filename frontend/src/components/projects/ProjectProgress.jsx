import t from '../../i18n/es.js';
import { ProgressBar } from '../ui/ProgressBar.jsx';

/** Progreso de un proyecto (tareas completadas / totales). */
export function ProjectProgress({ completed, total }) {
  const percent = total > 0 ? (completed / total) * 100 : 0;
  return <ProgressBar value={percent} label={total > 0 ? t.progress.label(completed, total) : t.progress.noTasks} />;
}
