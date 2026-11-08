import t from '../../i18n/es.js';
import { SelectField } from '../ui/SelectField.jsx';
import { DeleteTaskButton } from './DeleteTaskButton.jsx';
import { PriorityBadge } from './PriorityBadge.jsx';

const STATUS_OPTIONS = Object.entries(t.taskStatus).map(([value, label]) => ({ value, label }));

/** Una tarea: título, descripción, prioridad, selector de estado y borrado. */
export function TaskItem({ task, position, saving, error, onStatusChange, onDelete }) {
  const completed = task.status === 'completed';
  const errorId = error ? `task-${task.id}-error` : undefined;

  return (
    <li className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 tabular-nums" aria-hidden="true">
              {position}.
            </span>
            <h3 className={`font-medium ${completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{task.title}</h3>
            <PriorityBadge priority={task.priority} />
          </div>
          {task.description && <p className={`mt-1 text-sm ${completed ? 'text-slate-400' : 'text-slate-600'}`}>{task.description}</p>}
        </div>

        <div className="flex items-center gap-2 sm:shrink-0">
          <SelectField
            id={`task-${task.id}-status`}
            label={t.tasks.statusLabel(task.title)}
            hideLabel
            options={STATUS_OPTIONS}
            value={task.status}
            disabled={saving}
            aria-describedby={errorId}
            onChange={(event) => onStatusChange(task, event.target.value)}
            className="w-40"
          />
          <DeleteTaskButton taskTitle={task.title} onConfirm={() => onDelete(task)} />
        </div>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </li>
  );
}
